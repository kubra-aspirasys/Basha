const http = require('http');

// Configuration
const PORT = 5000;
const HOST = 'localhost';
const PREFIX = '/api/notifications';

// Admin Credentials (from fix-users.js)
const ADMIN_EMAIL = 'admin@bashabiryani.com';
const ADMIN_PASSWORD = 'admin123';

let token = '';
let createdNotificationId = '';

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
                    // Log the raw data to a file
                    require('fs').writeFileSync('debug_response.txt', data);
                    console.error(`[ERROR] Failed to parse JSON for ${name}. Raw Data saved to debug_response.txt`);
                    reject(new Error(`Invalid JSON response: ${e.message}`));
                    return;
                }

                if (res.statusCode >= 200 && res.statusCode < 300) {
                    console.log(`[PASS] ${name}`);
                    resolve(parsed);
                } else {
                    console.error(`[FAIL] ${name} - Status: ${res.statusCode}`, JSON.stringify(parsed, null, 2));
                    reject(new Error(`Request failed with status ${res.statusCode}`));
                }
            });
        });

        req.on('error', (e) => {
            console.error(`[ERROR] ${name}:`, e.message);
            reject(e);
        });

        if (postData) {
            req.write(JSON.stringify(postData));
        }
        req.end();
    });
};

const login = async () => {
    const data = await request('Admin Login', {
        hostname: HOST,
        port: PORT,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    token = data.data.token;
};

const runTests = async () => {
    try {
        console.log('--- Starting Notifications Verification ---');
        await login();

        // 1. Create a Notification
        const createRes = await request('Create Notification', {
            hostname: HOST,
            port: PORT,
            path: PREFIX,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }, {
            type: 'info',
            title: 'Test Verification Notification',
            message: 'This is a test notification for verification script',
            priority: 'high'
        });
        createdNotificationId = createRes.data.id;

        // 2. Search (Case Insensitive)
        // Searching for "test verification" (lowercase) matching "Test Verification" (Title)
        const searchRes = await request('Search Notifications (Case Insensitive)', {
            hostname: HOST,
            port: PORT,
            path: `${PREFIX}?search=test%20verification`,
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const found = searchRes.data.notifications.some(n => n.id === createdNotificationId);
        if (found) {
            console.log('[PASS] specific notification found correctly via search');
        } else {
            console.error('[FAIL] Created notification not found in search results');
        }

        // 3. Mark as Read
        await request('Mark as Read', {
            hostname: HOST,
            port: PORT,
            path: `${PREFIX}/${createdNotificationId}/read`,
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        // 4. Verify it is read
        const getRes = await request('Get Notification Details', {
            hostname: HOST,
            port: PORT,
            path: `${PREFIX}/${createdNotificationId}`,
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (getRes.data.is_read === true) {
            console.log('[PASS] Notification is marked as read');
        } else {
            console.error('[FAIL] Notification is NOT marked as read');
        }

        // 5. Delete Notification
        await request('Delete Notification', {
            hostname: HOST,
            port: PORT,
            path: `${PREFIX}/${createdNotificationId}`,
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('--- Verification Completed Successfully ---');

    } catch (error) {
        console.error('--- Verification Failed ---', error);
        process.exit(1);
    }
};

runTests();
