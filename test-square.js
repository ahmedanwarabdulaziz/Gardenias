const { SquareClient, SquareEnvironment } = require('square');

const client = new SquareClient({
  token: 'EAAAlzEk3J9X9_Pc6U30dy-BslWYKR52B-ZJBHowJMfiKhm6gvqnRr1tpFiDCB0X',
  environment: SquareEnvironment.Production,
});

async function test() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const bMin = startOfMonth.toISOString();
  const bMax = now.toISOString();

  try {
    const payRes = await client.payments.list({beginTime: bMin, endTime: bMax});
    const payData = payRes.result?.payments || [];
    console.log(`Found ${payData.length} payments this month.`);
    if (payData.length > 0) {
      console.log('Sample payment date:', payData[0].createdAt);
    }
  } catch(e) { console.error('Payments:', e.message); }

  try {
    const bookRes = await client.bookings.list({startAtMin: bMin, startAtMax: bMax});
    const bookData = bookRes.result?.bookings || [];
    console.log(`Found ${bookData.length} bookings this month.`);
  } catch(e) { console.error('Bookings:', e.message); }
}

test();
