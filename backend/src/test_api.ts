import app from './app';
import { connectDatabase, sequelize } from './config/database';
import http from 'http';

const runVerification = async () => {
  console.log('🧪 Starting Comprehensive API Verification Suite...');

  await connectDatabase();
  await sequelize.sync();

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as any;
  const baseUrl = `http://localhost:${address.port}/api`;

  console.log(`🌐 Test server listening at ${baseUrl}`);

  const assertSuccess = (res: any, stepName: string) => {
    if (!res || !res.success) {
      throw new Error(`Step [${stepName}] Failed: ${res?.message || JSON.stringify(res)}`);
    }
  };

  try {
    // 1. Health Check
    const resHealth: any = await fetch(`${baseUrl}/health`).then((r) => r.json());
    assertSuccess(resHealth, 'Health Check');
    console.log('✅ 1. Health Check: PASSED -', resHealth.message);

    // 2. User Login
    const resUserLogin: any = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@foodfarma.com', password: 'user123' }),
    }).then((r) => r.json());
    assertSuccess(resUserLogin, 'User Login');
    const userToken = resUserLogin.data?.accessToken;
    if (!userToken) throw new Error('User access token missing in login response');
    console.log('✅ 2. User Login: PASSED');

    // 3. Admin Login
    const resAdminLogin: any = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@foodfarma.com', password: 'admin123' }),
    }).then((r) => r.json());
    assertSuccess(resAdminLogin, 'Admin Login');
    const adminToken = resAdminLogin.data?.accessToken;
    if (!adminToken) throw new Error('Admin access token missing in login response');
    console.log('✅ 3. Admin Login: PASSED');

    // 4. Fetch Categories
    const resCategories: any = await fetch(`${baseUrl}/categories`).then((r) => r.json());
    assertSuccess(resCategories, 'Fetch Categories');
    console.log(`✅ 4. Categories List: ${resCategories.data?.length || 0} categories found.`);

    // 5. Fetch Restaurants
    const resRestaurants: any = await fetch(`${baseUrl}/restaurants`).then((r) => r.json());
    assertSuccess(resRestaurants, 'Fetch Restaurants');
    console.log(`✅ 5. Restaurants List: ${resRestaurants.data?.length || 0} restaurants found.`);

    // 6. Fetch Foods
    const resFoods: any = await fetch(`${baseUrl}/foods`).then((r) => r.json());
    assertSuccess(resFoods, 'Fetch Foods');
    console.log(`✅ 6. Food Items List: ${resFoods.data?.length || 0} food items found.`);

    const targetFood = resFoods.data?.[0];
    if (!targetFood) throw new Error('No food items found to test cart creation');

    // 7. Add Item to Cart
    const resAddToCart: any = await fetch(`${baseUrl}/cart/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ foodId: targetFood.id, quantity: 2 }),
    }).then((r) => r.json());
    assertSuccess(resAddToCart, 'Add to Cart');
    console.log('✅ 7. Add to Cart: PASSED');

    // 8. Get Cart
    const resGetCart: any = await fetch(`${baseUrl}/cart`, {
      headers: { Authorization: `Bearer ${userToken}` },
    }).then((r) => r.json());
    assertSuccess(resGetCart, 'Get Cart');
    console.log(`✅ 8. Cart Content: ${resGetCart.data?.items?.length || 0} item(s), Total: ₹${resGetCart.data?.totalAmount}`);

    // 9. Get or Create User Address
    const resAddresses: any = await fetch(`${baseUrl}/addresses`, {
      headers: { Authorization: `Bearer ${userToken}` },
    }).then((r) => r.json());
    assertSuccess(resAddresses, 'Get User Addresses');

    let addressId = resAddresses.data?.[0]?.id;
    if (!addressId) {
      console.log('⚠️ No existing address found, creating test address...');
      const resCreateAddress: any = await fetch(`${baseUrl}/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          fullName: 'Test User',
          phone: '9876543210',
          addressLine: '123 Main Street',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560001',
          isDefault: true,
        }),
      }).then((r) => r.json());
      assertSuccess(resCreateAddress, 'Create Address');
      addressId = resCreateAddress.data.id;
    }
    console.log('✅ 9. Delivery Address: PASSED (ID:', addressId, ')');

    // 10. Place Order
    const resCreateOrder: any = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        addressId,
        paymentMethod: 'ONLINE',
        deliveryInstructions: 'Leave at front desk',
      }),
    }).then((r) => r.json());
    assertSuccess(resCreateOrder, 'Place Order');
    const orderId = resCreateOrder.data?.id;
    console.log('✅ 10. Order Placement: PASSED (Order ID:', orderId, ')');

    // 11. Create Razorpay Payment Order
    const resRzpOrder: any = await fetch(`${baseUrl}/payments/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ orderId }),
    }).then((r) => r.json());
    assertSuccess(resRzpOrder, 'Razorpay Order Creation');
    const razorpayOrderId = resRzpOrder.data?.razorpayOrderId;
    console.log('✅ 11. Razorpay Order Creation: PASSED (RZP ID:', razorpayOrderId, ')');

    // 12. Verify Payment
    const resVerifyPayment: any = await fetch(`${baseUrl}/payments/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        orderId,
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: 'pay_simulated_test_123',
        razorpay_signature: 'simulated_signature',
      }),
    }).then((r) => r.json());
    assertSuccess(resVerifyPayment, 'Payment Verification');
    console.log('✅ 12. Payment Verification: PASSED (Status:', resVerifyPayment.data?.status, ')');

    // 13. Admin Dashboard Stats
    const resAdminStats: any = await fetch(`${baseUrl}/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then((r) => r.json());
    assertSuccess(resAdminStats, 'Admin Stats');
    console.log('✅ 13. Admin Dashboard Stats: PASSED', resAdminStats.data?.metrics);

    console.log('\n🎉 ALL BACKEND API ENDPOINTS VERIFIED SUCCESSFULLY WITH 100% PASS RATE!');

    server.close();
    process.exit(0);
  } catch (err: any) {
    console.error('❌ API Verification Failed:', err.message || err);
    server.close();
    process.exit(1);
  }
};

runVerification();
