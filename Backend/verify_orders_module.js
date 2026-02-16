const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
const ADMIN_EMAIL = 'admin@bashabiryani.com';
const ADMIN_PASS = 'admin123';
const CUSTOMER_EMAIL = 'customer@bashabiryani.com';
const CUSTOMER_PASS = 'customer123';

let adminToken = '';
let customerToken = '';
let createdOrderId = '';
let menuItemId = '';

const login = async (email, password, role) => {
    try {
        const response = await axios.post(`${BASE_URL}/auth/login`, {
            email,
            password,
            role
        });
        console.log(`✅ Login successful for ${role}`);
        return response.data.data.token;
    } catch (error) {
        console.error(`❌ Login failed for ${role}:`, error.response?.data?.message || error.message);
        process.exit(1);
    }
};

const getMenuItem = async () => {
    try {
        // Use /api/menu/all to get all available items
        const response = await axios.get(`${BASE_URL}/menu/all`);
        if (response.data.data && response.data.data.length > 0) {
            console.log(`✅ Fetched menu items. Using item: ${response.data.data[0].name}`);
            return response.data.data[0].id;
        } else {
            console.error('❌ No menu items found. Cannot create order.');
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ Failed to fetch menu items:', error.response?.data?.message || error.message);
        // Try fallback to /api/menu just in case
        try {
            // Note: GET /api/menu might return paginated structure { success: true, data: { rows: [] } } depending on implementation
            const response = await axios.get(`${BASE_URL}/menu`);
            const items = response.data.data.rows || response.data.data;
            if (items && items.length > 0) {
                console.log(`✅ Fetched menu items from /menu. Using item: ${items[0].name}`);
                return items[0].id;
            }
        } catch (e) {
            console.error('❌ Failed to fetch menu items from fallback:', e.message);
            process.exit(1);
        }
        process.exit(1);
    }
};

const createOrder = async () => {
    try {
        const orderData = {
            customer_name: 'Test Customer',
            customer_phone: '9876543210',
            delivery_address: 'Test Address 123',
            order_type: 'delivery',
            items: [
                {
                    menu_item_id: menuItemId,
                    quantity: 2
                }
            ],
            payment_method: 'cod'
        };

        const response = await axios.post(`${BASE_URL}/customer/orders`, orderData, {
            headers: { Authorization: `Bearer ${customerToken}` }
        });
        console.log(`✅ Order created successfully. Order Number: ${response.data.data.order_number}`);
        createdOrderId = response.data.data.id;
        return createdOrderId;
    } catch (error) {
        console.error('❌ Failed to create order:', error.response?.data?.message || error.message);
        // Dont exit, maybe we can test other things or it failed due to known bug
    }
};

const verifyOrderListing = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/admin/orders`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        const order = response.data.data.find(o => o.id === createdOrderId);
        if (order) {
            console.log('✅ Order found in Admin Listing');
        } else {
            console.error('❌ Order NOT found in Admin Listing');
        }
    } catch (error) {
        console.error('❌ Failed to list orders:', error.response?.data?.message || error.message);
    }
};

const updateStatus = async (status, shouldFail = false) => {
    try {
        const response = await axios.put(`${BASE_URL}/admin/orders/${createdOrderId}/status`,
            { status },
            { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        if (shouldFail) {
            console.error(`❌ Order status update to '${status}' SUCCEEDED but SHOULD HAVE FAILED`);
        } else {
            console.log(`✅ Order status updated to '${status}'`);
        }
    } catch (error) {
        if (shouldFail) {
            console.log(`✅ Order status update to '${status}' FAILED as expected: ${error.response?.data?.message || error.message}`);
        } else {
            console.error(`❌ Failed to update status to '${status}':`, error.response?.data?.message || error.message);
        }
    }
};

const runTests = async () => {
    console.log('🚀 Starting Orders Module Verification...');

    // 1. Login
    adminToken = await login(ADMIN_EMAIL, ADMIN_PASS, 'admin');
    customerToken = await login(CUSTOMER_EMAIL, CUSTOMER_PASS, 'customer');

    // 2. Get Menu Item
    menuItemId = await getMenuItem();

    // 3. Create Order
    await createOrder();

    if (createdOrderId) {
        // 4. Verify Listing
        await verifyOrderListing();

        // 5. Test Status Transitions
        console.log('\n--- Testing Status Transitions ---');
        await updateStatus('confirmed');
        await updateStatus('preparing');

        // Negative Test: Backward transition (Preparing -> Pending)
        // CHECK: Does the system currently prevent this?
        console.log('--- Testing Invalid Backward Transition (Preparing -> Pending) ---');
        await updateStatus('pending', true);

        // Continue happy path
        await updateStatus('ready_for_pickup'); // Note: Frontend uses 'ready_for_pickup' but backend ENUM has this? Let's check model.
        // Model: 'pending', 'confirmed', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled'
        // Yes 'ready_for_pickup' is correct.

        await updateStatus('out_for_delivery');
        await updateStatus('delivered');

        // Negative Test: Update after Delivered
        console.log('--- Testing Update after Delivered (Delivered -> Confirmed) ---');
        await updateStatus('confirmed', true);
    }

    console.log('\n✅ Verification Complete.');
};

runTests();
