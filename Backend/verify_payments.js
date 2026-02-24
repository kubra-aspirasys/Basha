const axios = require('axios');
const { Sequelize } = require('sequelize');
const config = require('./src/config/database.js')['development'];
const { Payment, sequelize } = require('./src/models');

const BASE_URL = 'http://localhost:5000/api';

// MOCK DATA
const TEST_CUSTOMER_NAME = 'Test User PaymentVerified';
const TEST_AMOUNT = 1500.50;
const TEST_MODE = 'card';

async function runVerification() {
    console.log('🚀 Starting Payments Module Verification...');

    let token;
    try {
        console.log('🔑 Logging in as Admin...');
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@bashabiryani.com',
            password: 'admin123'
        });
        token = loginRes.data.data ? loginRes.data.data.token : loginRes.data.token; // Handle potential response structure diffs
        if (!token) throw new Error('Token not found in login response');
        console.log('✅ Login successful.');
    } catch (error) {
        console.error('❌ Login failed. Please ensure server is running and credentials are correct.');
        console.error(error.response?.data || error.message);
        return;
    }

    const headers = { Authorization: `Bearer ${token}` };
    const apiClient = axios.create({ baseURL: BASE_URL, headers });

    let paymentId;
    let transactionId;

    try {
        // 2. Create a Payment
        console.log('\n2️⃣ Testing Create Payment...');
        const createPayload = {
            customer_name: TEST_CUSTOMER_NAME,
            amount: TEST_AMOUNT,
            payment_mode: TEST_MODE,
            status: 'pending',
            notes: 'Verification Script Test Payment'
        };
        const createRes = await apiClient.post('/payments', createPayload);
        if (createRes.status === 201 && createRes.data.success) {
            paymentId = createRes.data.data.id;
            transactionId = createRes.data.data.transaction_id;
            console.log(`✅ Payment Created. ID: ${paymentId}, TXN: ${transactionId}`);
        } else {
            console.error('❌ Create Payment Failed:', createRes.data);
            throw new Error('Create Payment Failed');
        }

        // 3. Verify Payment in List
        console.log('\n3️⃣ Verifying Payment in List...');
        const listRes = await apiClient.get('/payments?customer_name=' + TEST_CUSTOMER_NAME);
        const found = listRes.data.data.find(p => p.id === paymentId);
        if (found) {
            console.log('✅ Payment found in list.');
        } else {
            console.error('❌ Payment NOT found in list.');
        }

        // 4. Test Statistics (Before Status Update)
        console.log('\n4️⃣ Checking Stats (Pending)...');
        const statsResBefore = await apiClient.get('/payments/stats');
        console.log('   Stats:', JSON.stringify(statsResBefore.data.data, null, 2));

        // 5. Update Status to Completed
        console.log('\n5️⃣ Testing Update Status (Pending -> Completed)...');
        const updateRes = await apiClient.put(`/payments/${paymentId}/status`, { status: 'completed' });
        if (updateRes.data.success && updateRes.data.data.status === 'completed') {
            console.log('✅ Status Updated to Completed.');
        } else {
            console.error('❌ Status Update Failed:', updateRes.data);
        }

        // 6. Test Statistics (After Status Update)
        console.log('\n6️⃣ Checking Stats (Completed) - REVENUE CHECK...');
        const statsResAfter = await apiClient.get('/payments/stats');
        console.log('   Stats:', JSON.stringify(statsResAfter.data.data, null, 2));


        // 7. Verify Data Persistence (Direct DB Check)
        console.log('\n7️⃣ Verifying DB Persistence...');
        const dbPayment = await Payment.findByPk(paymentId);
        if (dbPayment && dbPayment.status === 'completed') {
            const amount = parseFloat(dbPayment.amount);
            if (amount === TEST_AMOUNT) {
                console.log('✅ DB Verification Passed: Status is completed, Amount matches.');
            } else {
                console.error(`❌ DB Verification Failed: Amount mismatch. Expected ${TEST_AMOUNT}, got ${amount}`);
            }
        } else {
            console.error('❌ DB Verification Failed: Payment not found or status incorrect.');
        }

        // 8. Test Delete (Soft Delete)
        console.log('\n8️⃣ Testing Delete Payment...');
        const deleteRes = await apiClient.delete(`/payments/${paymentId}`);
        if (deleteRes.status === 200) {
            console.log('✅ Delete successful.');

            // Verify it's gone from list (or soft deleted)
            const verifyDelete = await Payment.findByPk(paymentId, { paranoid: false });
            if (verifyDelete && verifyDelete.deletedAt) {
                console.log('✅ Payment is soft deleted in DB.');
            } else {
                console.error('❌ Payment is NOT soft deleted in DB.');
            }
        } else {
            console.error('❌ Delete Failed:', deleteRes.data);
        }

        // 9. Test Export API
        console.log('\n9️⃣ Testing Export API...');
        const exportRes = await apiClient.get('/payments/export', { responseType: 'blob' }); // or text since we want to check content
        // Axios responseType 'blob' returns blob in browser, 'stream' or buffer in node. 
        // Let's just use default (json/text) and check headers.
        const exportResText = await apiClient.get('/payments/export');

        if (exportResText.status === 200 && exportResText.headers['content-type'].includes('text/csv')) {
            console.log('✅ Export API returned CSV content.');
            if (exportResText.data.includes('Transaction ID,Customer,Amount')) {
                console.log('✅ CSV Headers validated.');
            } else {
                console.error('❌ CSV Headers missing or incorrect.');
            }
        } else {
            console.error('❌ Export API Failed:', exportResText.status, exportResText.headers);
        }

        console.log('\n🎉 Verification Completed Successfully!');

    } catch (error) {
        console.error('\n❌ Verification Failed:', error.message);
        if (error.response) {
            console.error('Response Data:', error.response.data);
            console.error('Response Status:', error.response.status);
        }
    }
}

runVerification();
