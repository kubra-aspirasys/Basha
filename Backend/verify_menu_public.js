const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/menu';

async function testPublicAccess() {
    console.log('Testing public access to Menu API...');

    try {
        // Test 1: List Menu Items (Public)
        console.log('\n--- Test 1: GET /menu-items (Public) ---');
        try {
            const res = await axios.get(`${BASE_URL}`);
            console.log('✅ Success: Accessed /menu-items without token');
            console.log(`Received ${res.data.data.length} items`);
        } catch (error) {
            console.error('❌ Failed: /menu-items requires auth or failed', error.response ? error.response.status : error.message);
        }

        // Test 2: List Categories (Public)
        console.log('\n--- Test 2: GET /menu-items/categories (Public) ---');
        try {
            const res = await axios.get(`${BASE_URL}/categories`);
            console.log('✅ Success: Accessed /menu-items/categories without token');
            console.log(`Received ${res.data.data.length} categories`);
        } catch (error) {
            console.error('❌ Failed: /menu-items/categories requires auth or failed', error.response ? error.response.status : error.message);
        }

        // Test 3: List Types (Public)
        console.log('\n--- Test 3: GET /menu-items/types (Public) ---');
        try {
            const res = await axios.get(`${BASE_URL}/types`);
            console.log('✅ Success: Accessed /menu-items/types without token');
            console.log(`Received ${res.data.data.length} types`);
        } catch (error) {
            console.error('❌ Failed: /menu-items/types requires auth or failed', error.response ? error.response.status : error.message);
        }

    } catch (error) {
        console.error('Unexpected error during verification:', error.message);
    }
}

testPublicAccess();
