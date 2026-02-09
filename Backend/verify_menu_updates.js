const API_URL = 'http://localhost:5000/api/menu';

async function login() {
    // Try a few default credentials
    const creds = [
        { email: 'admin@bashabiryani.com', password: 'admin123' }, // Correct one from seeder
        { email: 'admin@basha.com', password: 'password123' },
        { email: 'admin@example.com', password: 'password' },
        { email: 'admin@basha.com', password: 'password' },
        { email: 'admin@example.com', password: 'password123' }
    ];

    for (const cred of creds) {
        try {
            const res = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cred)
            });
            if (res.ok) {
                const responseBody = await res.json();
                console.log('Logged in with:', cred.email);
                return responseBody.data.token;
            }
        } catch (e) {
            console.error('Login error:', e.message);
        }
    }
    return null;
}

async function run() {
    const token = await login();
    if (!token) {
        console.error('Could not login. Skipping verification.');
        return;
    }

    // -1. Check Root Endpoint
    try {
        const rootRes = await fetch('http://localhost:5000/');
        console.log('Root / Status:', rootRes.status);
        const rootText = await rootRes.text();
        console.log('Root / Body:', rootText);
    } catch (e) {
        console.error('Root / Failed:', e.message);
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
    console.log('Token (first 10 chars):', token ? token.substring(0, 10) : 'null');

    // 0. Test GET /api/menu (List Items)
    try {
        const res = await fetch(API_URL, { headers });
        console.log('GET /api/menu Status:', res.status);
    } catch (e) {
        console.error('GET /api/menu Failed:', e.message);
    }

    // 1. Create Category
    try {
        const catName = 'Test Cat ' + Date.now();
        console.log('Creating category:', catName);
        const res = await fetch(`${API_URL}/categories`, { // Adjusted path based on routes
            method: 'POST',
            headers,
            body: JSON.stringify({ name: catName })
        });
        const text = await res.text();
        console.log('Create Category Status:', res.status);
        console.log('Create Category Body:', text);
        try {
            const data = JSON.parse(text);
            console.log('Parsed Data:', data);
        } catch (jsonError) {
            console.error('JSON Parse Error:', jsonError.message);
        }
    } catch (e) {
        console.error('Create Category Failed (Network/Other):', e.toString());
    }

    // 2. Create Type
    try {
        const typeName = 'Test Type ' + Date.now();
        console.log('Creating type:', typeName);
        const res = await fetch(`${API_URL}/types`, { // Adjusted path based on routes
            method: 'POST',
            headers,
            body: JSON.stringify({ name: typeName })
        });
        const text = await res.text();
        console.log('Create Type Status:', res.status);
        console.log('Create Type Body:', text);
        try {
            const data = JSON.parse(text);
            console.log('Parsed Data:', data);
        } catch (jsonError) {
            console.error('JSON Parse Error:', jsonError.message);
        }
    } catch (e) {
        console.error('Create Type Failed (Network/Other):', e.toString());
    }
}

run();
