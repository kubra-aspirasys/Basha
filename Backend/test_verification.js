const http = require('http');

function request(label, options, data) {
    return new Promise((resolve, reject) => {
        console.log(`\n[${label}] Requesting ${options.method} ${options.path}...`);
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                console.log(`[${label}] Response Code: ${res.statusCode}`);
                try {
                    const parsed = JSON.parse(body);
                    resolve({ statusCode: res.statusCode, body: parsed });
                } catch (e) {
                    console.log(`[${label}] Response Body (Raw): ${body.substring(0, 200)}...`);
                    resolve({ statusCode: res.statusCode, body: body });
                }
            });
        });

        req.on('error', (e) => {
            console.error(`[${label}] Network Error:`, e.message);
            reject(e);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

const PORT = process.env.TEST_PORT || 5000;

async function runTests() {
    try {
        // 1. Login
        const loginRes = await request('LOGIN', {
            hostname: 'localhost',
            port: PORT,
            path: '/api/auth/login',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, { email: 'admin@bashabiryani.com', password: 'admin123' });

        if (loginRes.statusCode !== 200) throw new Error('Login Failed');
        const token = loginRes.body.data.token;
        console.log('Token:', token ? 'Recieved' : 'Missing');

        // 2. Stats
        const statsRes = await request('STATS', {
            hostname: 'localhost',
            port: PORT,
            path: '/api/customers/stats',
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        // 3. Create
        const createRes = await request('CREATE', {
            hostname: 'localhost',
            port: PORT,
            path: '/api/customers',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }, {
            name: 'Test Verify',
            email: `verify_${Date.now()}@test.com`,
            phone: `9199${Date.now().toString().slice(-6)}`, // Ensure unique phone
            address: 'Verification Addr'
        });

        // 4. List
        await request('LIST', {
            hostname: 'localhost',
            port: PORT,
            path: '/api/customers?limit=5',
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        // 5. Block Customer
        if (createRes.body.success && createRes.body.data.id) {
            console.log('\n[5] Blocking Customer...');
            const blockRes = await request('BLOCK', {
                hostname: 'localhost',
                port: PORT,
                path: `/api/customers/${createRes.body.data.id}/status`,
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            }, { is_blocked: true });
            console.log('Block Code:', blockRes.statusCode);
            console.log('Block Data:', blockRes.body);
        }

    } catch (err) {
        console.error('Test Suite Failed:', err);
    }
}

runTests();
