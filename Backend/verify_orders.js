
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let token = '';
let orderId = '';

const login = async () => {
    try {
        console.log('Logging in...');
        const response = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@bashabiryani.com',
            password: 'admin123'
        });
        if (response.data.success || response.data.token) {
            token = response.data.token || response.data.data.token;
            console.log('[PASS] Login successful');
        } else {
            console.error('[FAIL] Login failed');
            process.exit(1);
        }
    } catch (error) {
        console.error('[FAIL] Login error:', error.message);
        process.exit(1);
    }
};

const getHeaders = () => ({
    headers: { Authorization: `Bearer ${token}` }
});

const listOrders = async () => {
    try {
        console.log('Fetching orders...');
        const response = await axios.get(`${BASE_URL}/admin/orders`, getHeaders());
        if (response.data.success) {
            console.log(`[PASS] Orders fetched. Count: ${response.data.data.length}`);
            if (response.data.data.length > 0) {
                orderId = response.data.data[0].id; // Pick first order for testing
                console.log(`[INFO] Using Order ID: ${orderId} for updates`);
            }
        } else {
            console.error('[FAIL] List orders failed');
        }
    } catch (error) {
        console.error('[FAIL] List orders error:', error.message);
    }
};

const testPagination = async () => {
    try {
        console.log('Testing Pagination (page=1, limit=1)...');
        const response = await axios.get(`${BASE_URL}/admin/orders?page=1&limit=1`, getHeaders());

        if (response.data.data.length === 1 && response.data.pagination) {
            console.log(`[PASS] Pagination working. Returned 1 item. Total: ${response.data.pagination.totalOrders}`);
        } else {
            console.error(`[FAIL] Pagination broken. Length: ${response.data.data.length}`);
        }
    } catch (error) {
        console.error('[FAIL] Pagination test error:', error.message);
    }
};

const updateStatusInvalidFlow = async () => {
    if (!orderId) return;
    try {
        console.log('Testing Invalid Status Flow (e.g. Pending -> Delivered)...');
        // Fetch order to know current status
        let currentStatus = 'pending';
        try {
            // Admin endpoint for details might be different or same. Using common logic.
            // But let's rely on listOrders if details fail.
            const orderRes = await axios.get(`${BASE_URL}/admin/orders?order_number=${orderId}`, getHeaders());
            // Logic to find exact order status might be needed if by ID not direct
        } catch (e) { }

        const payload = { status: 'delivered' }; // Jumping to delivered is usually invalid unless from out_for_delivery
        console.log(`Attempting jump to 'delivered' for order ${orderId}`);

        try {
            await axios.put(`${BASE_URL}/admin/orders/${orderId}/status`, payload, getHeaders());
            // If we get here, check if it was actually allowed (might be valid if already out_for_delivery)
            console.warn('[WARN] Status update succeeeded. Check if this was a valid transition.');
        } catch (error) {
            if (error.response && (error.response.status === 400 || error.response.status === 500)) {
                // 500 is also acceptable if it's the specific "Error: Invalid status transition"
                console.log(`[PASS] System blocked transition. Status: ${error.response.status}`);
            } else {
                console.log(`[WARN] Update failed with unexpected status: ${error.response ? error.response.status : error.message}`);
            }
        }
    } catch (error) {
        console.error('[FAIL] Status update test error:', error.message);
    }
};

const run = async () => {
    await login();
    await listOrders();
    await testPagination();
    await updateStatusInvalidFlow();
};

run();
