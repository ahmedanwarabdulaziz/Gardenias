const { SquareClient, SquareEnvironment } = require('square');

const client = new SquareClient({
  token: 'EAAAlzEk3J9X9_Pc6U30dy-BslWYKR52B-ZJBHowJMfiKhm6gvqnRr1tpFiDCB0X',
  environment: SquareEnvironment.Production,
});

async function test() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  
  const bMin = startOfMonth.toISOString();
  const bMax = endOfMonth.toISOString(); 

  try {
    const custRes = await client.customers.list();
    const customers = custRes.data || custRes.customers || [];
    console.log(`Initial Customer List fetched. Count: ${customers.length}`);

    const payRes = await client.payments.list({ beginTime: bMin, endTime: bMax });
    const payments = payRes.data || payRes.payments || [];
    console.log(`Found ${payments.length} Payments`);
    
    payments.forEach(p => console.log(`Payment ID: ${p.id}, Customer ID: ${p.customerId}`));

    const bookRes = await client.bookings.list({ startAtMin: bMin, startAtMax: bMax });
    const bookings = bookRes.data || bookRes.bookings || [];
    console.log(`Found ${bookings.length} Bookings`);
    
    bookings.forEach(b => console.log(`Booking ID: ${b.id}, Customer ID: ${b.customerId}`));

  } catch(e) {
    console.error(e.message);
  }
}

test();
