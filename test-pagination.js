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
    let allBookings = [];
    let cursor = undefined;

    do {
       const bookRes = await client.bookings.list({ startAtMin: bMin, startAtMax: bMax, cursor, limit: 100 });
       const pageBookings = bookRes.data || bookRes.bookings || [];
       allBookings = allBookings.concat(pageBookings);
       cursor = bookRes.cursor;
    } while (cursor);

    console.log(`Fully Fetched Bookings: ${allBookings.length}`);

    let allPayments = [];
    cursor = undefined;
    do {
       const payRes = await client.payments.list({ beginTime: bMin, endTime: bMax, cursor, limit: 100 });
       const pagePayments = payRes.data || payRes.payments || [];
       allPayments = allPayments.concat(pagePayments);
       cursor = payRes.cursor;
    } while (cursor);
    console.log(`Fully Fetched Payments: ${allPayments.length}`);

  } catch(e) {
    console.error(e.message);
  }
}

test();
