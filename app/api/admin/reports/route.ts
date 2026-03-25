import { NextRequest, NextResponse } from 'next/server';
import { getSquareClient, serializeSquareData } from '@/lib/square';

export async function GET(request: NextRequest) {
  try {
    const client = getSquareClient();
    
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    
    // Previous Month exact same period
    const startOfPastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayOfPastMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    const pastMonthDay = Math.min(now.getDate(), lastDayOfPastMonth);
    const pastMonthNow = new Date(now.getFullYear(), now.getMonth() - 1, pastMonthDay, 23, 59, 59, 999);

    const bMin = startOfMonth.toISOString();
    const bMax = endOfMonth.toISOString(); 

    const pMin = startOfPastMonth.toISOString();
    const pMax = pastMonthNow.toISOString();

    const dailyStats: Record<string, { day: string, revenue: number, bookings: number }> = {};
    const daysOrder = [];

    const numDays = endOfMonth.getDate();
    const currentMonthName = startOfMonth.toLocaleString('en-US', { month: 'short' });

    for (let i = 1; i <= numDays; i++) {
      const dayLabel = `${currentMonthName} ${i}`;
      dailyStats[dayLabel] = { day: dayLabel, revenue: 0, bookings: 0 };
      daysOrder.push(dayLabel);
    }

    let pastMonthRevenue = 0;
    let pastMonthBookings = 0;
    
    const uniqueCustomerIds = new Set<string>();
    
    let activePayments: any[] = [];
    let activeBookings: any[] = [];

    // Fetch Current Month Payments with Pagination
    try {
      let payCursor: string | undefined = undefined;
      do {
        const payRes: any = await client.payments.list({ beginTime: bMin, endTime: bMax, limit: 100, cursor: payCursor });
        const pagePayments = payRes.data || payRes.payments || [];
        activePayments.push(...pagePayments);
        payCursor = payRes.cursor || payRes.data?.cursor || undefined;
      } while (payCursor);
      
      for (const payment of activePayments) {
        if (payment.status === 'COMPLETED' && payment.createdAt && payment.amountMoney?.amount) {
          const d = new Date(payment.createdAt);
          const dayLabel = `${currentMonthName} ${d.getDate()}`;
          if (dailyStats[dayLabel]) {
            dailyStats[dayLabel].revenue += Number(payment.amountMoney.amount) / 100;
          }
        }
        if (payment.customerId) uniqueCustomerIds.add(payment.customerId);
      }
    } catch (e) {
      console.log('No current payments found', e);
    }

    // Fetch Current Month Bookings with Pagination
    try {
      let bookCursor: string | undefined = undefined;
      do {
        const bookRes: any = await client.bookings.list({ startAtMin: bMin, startAtMax: bMax, limit: 100, cursor: bookCursor });
        const pageBookings = bookRes.data || bookRes.bookings || [];
        activeBookings.push(...pageBookings);
        bookCursor = bookRes.cursor || bookRes.data?.cursor || undefined;
      } while (bookCursor);
      
      for (const booking of activeBookings) {
        if (booking.status !== 'CANCELED_BY_CUSTOMER' && booking.status !== 'CANCELED_BY_SELLER' && booking.startAt) {
          const d = new Date(booking.startAt);
          const dayLabel = `${currentMonthName} ${d.getDate()}`;
          if (dailyStats[dayLabel]) {
            dailyStats[dayLabel].bookings += 1;
          }
        }
        if (booking.customerId) uniqueCustomerIds.add(booking.customerId);
      }
    } catch (e) {
       console.log('Error fetching bookings', e);
    }

    // FETCH EXACT CUSTOMERS needed for these bookings/payments
    const customersMap = new Map();
    try {
      const idsToFetch = Array.from(uniqueCustomerIds);
      if (idsToFetch.length > 0) {
        const chunkSize = 30; // Chunk to avoid extremely massive promise.all blocks
        for (let i = 0; i < idsToFetch.length; i += chunkSize) {
          const chunk = idsToFetch.slice(i, i + chunkSize);
          const customerPromises = chunk.map(id => client.customers.retrieve(id).catch(() => null));
          const customerResults = await Promise.all(customerPromises);
          
          customerResults.forEach((res: any) => {
            if (res) {
               const c = res.data?.customer || res.customer || res; 
               if (c && c.id) customersMap.set(c.id, c);
            }
          });
        }
      }
    } catch(e) { console.error('Error fetching specific customers', e) }

    // Build Recent Bookings List
    let recentBookings: any[] = [];

    if (activeBookings.length > 0) {
      for (const booking of activeBookings) {
        const customer = booking.customerId ? customersMap.get(booking.customerId) : null;
        recentBookings.push({
           id: booking.id || Math.random().toString(),
           customerName: customer ? `${customer.givenName || ''} ${customer.familyName || ''}`.trim() || 'No Name Attached' : 'Guest Patient',
           customerEmail: customer?.emailAddress || 'N/A',
           customerPhone: customer?.phoneNumber || 'N/A',
           startAt: booking.startAt,
           status: booking.status
        });
      }
    } else {
      for (const payment of activePayments) {
         if (payment.status === 'COMPLETED' && payment.createdAt) {
            const d = new Date(payment.createdAt);
            const dayLabel = `${currentMonthName} ${d.getDate()}`;
            if (dailyStats[dayLabel]) {
                dailyStats[dayLabel].bookings += 1;
            }

            const customer = payment.customerId ? customersMap.get(payment.customerId) : null;
            recentBookings.push({
               id: payment.id || Math.random().toString(),
               customerName: customer ? `${customer.givenName || ''} ${customer.familyName || ''}`.trim() || 'No Name Attached' : 'Guest / Payment',
               customerEmail: customer?.emailAddress || 'N/A',
               customerPhone: customer?.phoneNumber || 'N/A',
               startAt: payment.createdAt,
               status: payment.status
            });
         }
      }
    }

    recentBookings.sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime());

    // Fetch Past Month Data for Comparison (with pagination)
    try {
      let pPayCursor: string | undefined = undefined;
      do {
        const pastPayRes: any = await client.payments.list({ beginTime: pMin, endTime: pMax, limit: 100, cursor: pPayCursor });
        const pPayments = pastPayRes.data || pastPayRes.payments || [];
        for (const payment of pPayments) {
          if (payment.status === 'COMPLETED' && payment.amountMoney?.amount) {
            pastMonthRevenue += Number(payment.amountMoney.amount) / 100;
          }
        }
        pPayCursor = pastPayRes.cursor || pastPayRes.data?.cursor || undefined;
      } while (pPayCursor);
    } catch (e) {}

    try {
      let pBookCursor: string | undefined = undefined;
      let pastBookingsCount = 0;
      do {
        const pastBookRes: any = await client.bookings.list({ startAtMin: pMin, startAtMax: pMax, limit: 100, cursor: pBookCursor });
        const pBookings = pastBookRes.data || pastBookRes.bookings || [];
        for (const booking of pBookings) {
          if (booking.status !== 'CANCELED_BY_CUSTOMER' && booking.status !== 'CANCELED_BY_SELLER') {
            pastMonthBookings += 1;
          }
        }
        pastBookingsCount += pBookings.length;
        pBookCursor = pastBookRes.cursor || pastBookRes.data?.cursor || undefined;
      } while (pBookCursor);
      
      // If zero bookings found from the actual bookings endpoint, fallback to past payments for booking count proxy
      if (pastMonthBookings === 0 && pastBookingsCount === 0) {
        let fallbackCursor: string | undefined = undefined;
        do {
          const fallBackRes: any = await client.payments.list({ beginTime: pMin, endTime: pMax, limit: 100, cursor: fallbackCursor });
          const pPayments = fallBackRes.data || fallBackRes.payments || [];
          for (const payment of pPayments) {
             if (payment.status === 'COMPLETED') pastMonthBookings += 1;
          }
          fallbackCursor = fallBackRes.cursor || fallBackRes.data?.cursor || undefined;
        } while (fallbackCursor);
      }
    } catch (e) {}

    let reportData = daysOrder.map(d => dailyStats[d]);
    let totalRevenue = reportData.reduce((acc, curr) => acc + curr.revenue, 0);
    let totalBookings = reportData.reduce((acc, curr) => acc + curr.bookings, 0);
    
    let isDemo = false;

    if (totalRevenue === 0 && totalBookings === 0 && pastMonthRevenue === 0 && recentBookings.length === 0) {
      isDemo = true;
      let mockRunningBookings = 0;
      let mockRunningRevenue = 0;

      reportData = daysOrder.map((dayLabel, index) => {
         const variance = Math.random() * 0.8 + 0.2; 
         const isWeekend = (index % 7) === 5 || (index % 7) === 6; 
         
         if (index <= now.getDate()) {
             const bks = isWeekend ? Math.round(5 * variance) : Math.round(15 * variance);
             const rev = bks * 100; 
             
             mockRunningRevenue += rev;
             mockRunningBookings += bks;
             return { day: dayLabel, revenue: rev, bookings: bks };
         } else {
             return { day: dayLabel, revenue: 0, bookings: 0 }; 
         }
      });

      totalRevenue = mockRunningRevenue;
      totalBookings = mockRunningBookings;
      pastMonthRevenue = Math.round(totalRevenue * 0.85);
      pastMonthBookings = Math.round(totalBookings * 0.85);
    }

    // Limit frontend recent bookings size if too massive
    recentBookings = recentBookings.slice(0, 500);

    return NextResponse.json({
      success: true,
      data: serializeSquareData({
        chartData: reportData,
        recentBookings,
        summary: { totalRevenue, totalBookings, pastMonthRevenue, pastMonthBookings },
        currentMonth: currentMonthName,
        isDemo
      })
    });
  } catch (error: any) {
    console.error('Error generating reports:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
