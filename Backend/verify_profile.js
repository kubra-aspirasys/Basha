const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/profile';
const AUTH_URL = 'http://localhost:5000/api/auth/login';

async function runTests() {
    console.log('--- PROFILE MODULE VERIFICATION ---');

    let token;
    try {
        console.log('1. Attempting Login...');
        const loginRes = await axios.post(AUTH_URL, {
            email: 'admin@bashabiryani.com',
            password: 'admin123'
        });
        console.log('ℹ️ Login Response Data:', JSON.stringify(loginRes.data));
        token = loginRes.data.data.token;
        console.log('✅ Login Successful, Token length:', token ? token.length : 0);
    } catch (error) {
        console.error('❌ Login Failed. Ensure server is running and credentials are correct.');
        if (error.response) console.error('   Error Data:', JSON.stringify(error.response.data));
        return;
    }

    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };
    console.log('ℹ️ Auth Headers:', JSON.stringify(authHeaders));

    // TC-PRF-15: Unauthorized Access
    try {
        console.log('2. Testing Unauthorized Access...');
        await axios.get(BASE_URL);
        console.log('❌ TC-PRF-15 Failed: Accessed profile without token');
    } catch (error) {
        if (error.response?.status === 401) {
            console.log('✅ TC-PRF-15 Passed: Access denied (401)');
        } else {
            console.log(`⚠️ TC-PRF-15 Unexpected Status: ${error.response?.status}`);
        }
    }

    // TC-PRF-01: View Profile
    try {
        console.log('3. Testing View Profile...');
        const res = await axios.get(BASE_URL, authHeaders);
        if (res.data.success) {
            console.log('✅ TC-PRF-01 Passed: Profile data fetched');
        } else {
            console.log('❌ TC-PRF-01 Failed: Success field is false');
        }
    } catch (error) {
        console.error('❌ TC-PRF-01 Failed:', error.message);
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Message:', error.response.data.message);
        }
    }

    // TC-PRF-06: Field Validation (Empty Name)
    try {
        console.log('4. Testing Empty Name Validation...');
        await axios.put(BASE_URL, { name: '' }, authHeaders);
        console.log('❌ TC-PRF-06 Failed: Profile updated with empty name');
    } catch (error) {
        if (error.response?.status === 400) {
            console.log(`✅ TC-PRF-06 Passed: Validation error caught: ${error.response.data.message}`);
        } else {
            console.log(`❌ TC-PRF-06 Unexpected Error: ${error.message}`);
        }
    }

    // TC-PRF-13: Mismatch New Password
    try {
        console.log('5. Testing Password Mismatch...');
        await axios.post(`${BASE_URL}/change-password`, {
            currentPassword: 'admin123',
            newPassword: 'NewPassword123!',
            confirmPassword: 'WrongMismatch'
        }, authHeaders);
        console.log('❌ TC-PRF-13 Failed: Password changed with mismatch');
    } catch (error) {
        if (error.response?.status === 400) {
            console.log(`✅ TC-PRF-13 Passed: Mismatch caught: ${error.response.data.message}`);
        } else {
            console.log(`❌ TC-PRF-13 Unexpected Error: ${error.message}`);
        }
    }

    // TC-PRF-14: Password Complexity
    try {
        console.log('6. Testing Password Complexity (Backend)...');
        await axios.post(`${BASE_URL}/change-password`, {
            currentPassword: 'admin123',
            newPassword: 'short',
            confirmPassword: 'short'
        }, authHeaders);
        console.log('❌ TC-PRF-14 Failed: Weak password accepted');
    } catch (error) {
        if (error.response?.status === 400) {
            console.log(`✅ TC-PRF-14 Passed: Complexity error caught: ${error.response.data.message}`);
        } else {
            console.log(`❌ TC-PRF-14 Unexpected Error: ${error.message}`);
        }
    }

    console.log('\n--- VERIFICATION COMPLETE ---');
}

runTests();
