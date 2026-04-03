const http = require('http');

// Configuration
const PORT = 5000;
const HOST = 'localhost';
const PREFIX = '/api/customers';
const ORDER_PREFIX = '/api/orders';

// Admin Credentials
const ADMIN_EMAIL = 'admin@bashafood.in';
const ADMIN_PASSWORD = 'admin123';

let token = '';

const request = (name, options, postData) => {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                let parsed = {};
                try {
                    parsed = data ? JSON.parse(data) : {};
                } catch (e) {
                    console.error(`[ERROR] Failed to parse JSON for ${name}:`, data);
                }

                if (res.statusCode >= 200 && res.statusCode < 300) {
                    console.log(`[PASS] ${name}`);
                    resolve(parsed);
                } else {
                    console.error(`[FAIL] ${name} - Status: ${res.statusCode}`, parsed);
                    resolve(parsed); // Resolve anyway to continue
                }
            });
        });

        req.on('error', (e) => {
            console.error(`[ERROR] ${name}: ${e.message}`);
            reject(e);
        });

        if (postData) {
            req.write(JSON.stringify(postData));
        }
        req.end();
    });
};

const login = async () => {
    const options = {
        hostname: HOST,
        port: PORT,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    };
    const data = await request('Login', options, { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    console.log('Login Response:', JSON.stringify(data));
    if (data.success || data.token) {
        token = data.token || (data.data && data.data.token);
        console.log('Token acquired:', token ? 'Yes' : 'No');
    } else {
        console.error('Login failed.');
        process.exit(1);
    }
};

const getStats = async () => {
    const options = {
        hostname: HOST,
        port: PORT,
        path: `${PREFIX}/stats`,
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    };
    await request('Get Stats', options);
};

const listCustomers = async (query = '') => {
    const options = {
        hostname: HOST,
        port: PORT,
        path: `${PREFIX}?${query}`,
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    };
    return await request(`List Customers (${query})`, options);
};

// Main Verification Flow
const runView = async () => {
    try {
        await login();
        await getStats();

        console.log('\n--- Testing Sorting Logic ---');
        // We assume there are identifying fields. 
        // Logic: specific sort parameter verification.
        const resSort = await listCustomers('limit=5&sort=spending&order=desc');
        if (resSort.success && resSort.data && resSort.data.length > 1) {
            const first = resSort.data[0].total_spent;
            const second = resSort.data[1].total_spent;
            console.log(`Sorted Spending: ${first} vs ${second}`);
            if (first < second) {
                console.error('[FAIL] Sorting by spending failed (First < Second)');
            }
        }

        console.log('\n--- Testing Search ---');
        const resSearch = await listCustomers('search=test&limit=5');

    } catch (e) {
        console.error('Test Suite Failed:', e);
    }
};

runView();
