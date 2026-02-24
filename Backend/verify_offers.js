const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';
const ADMIN_EMAIL = 'admin@bashabiryani.com';
const ADMIN_PASSWORD = 'admin123';

// MOCK DATA GENERATORS
const generateCode = (prefix) => `${prefix}_${Date.now()}`;
const getFutureDate = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
};
const getPastDate = (days) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
};

async function runVerification() {
    console.log('🚀 Starting Offers Module Verification (Port 5001)...');

    let token;
    let apiClient;

    // 1. Login
    try {
        console.log('🔑 Logging in as Admin...');
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
        });
        token = loginRes.data.data ? loginRes.data.data.token : loginRes.data.token;
        if (!token) throw new Error('Token not found');
        console.log('✅ Login successful.');
    } catch (error) {
        console.error('❌ Login failed:', error.message);
        return;
    }

    const headers = { Authorization: `Bearer ${token}` };
    apiClient = axios.create({ baseURL: BASE_URL, headers });

    // 2. Create Valid Percentage Offer
    const offerPCode = generateCode('OFFER_P');
    let offerPId;
    try {
        console.log(`\n2️⃣ Creating Valid Percentage Offer (${offerPCode})...`);
        const payload = {
            code: offerPCode,
            discount_type: 'percentage',
            discount_value: 10,
            valid_from: getPastDate(1), // Started yesterday
            valid_to: getFutureDate(5), // Ends in 5 days
            is_active: true
        };
        const res = await apiClient.post('/offers', payload);
        if (res.status === 201) {
            offerPId = res.data.data.id;
            console.log('✅ Offer Created Successfully.');
        } else {
            console.error('❌ Create Offer Failed:', res.data);
        }
    } catch (err) {
        console.error('❌ Create Offer Error:', err.response?.data || err.message);
    }

    // 3. Apply Valid Offer
    if (offerPId) {
        try {
            console.log('\n3️⃣ Applying Logic Test (Valid Offer)...');
            const res = await apiClient.post('/offers/validate', {
                code: offerPCode,
                order_total: 200
            });
            const expectedDiscount = 20; // 10% of 200
            if (parseFloat(res.data.data.calculated_discount) === expectedDiscount) {
                console.log(`✅ Discount Correct: ${expectedDiscount}`);
            } else {
                console.error(`❌ Discount Mismatch. Expected ${expectedDiscount}, got ${res.data.data.calculated_discount}`);
            }
        } catch (err) {
            console.error('❌ Apply Offer Error:', err.response?.data || err.message);
        }
    }

    // 4. Test Expired Logic
    const offerExpCode = generateCode('OFFER_EXP');
    try {
        console.log(`\n4️⃣ Testing Expired Offer Logic (${offerExpCode})...`);
        // Create offer that expired yesterday
        await apiClient.post('/offers', {
            code: offerExpCode,
            discount_type: 'fixed',
            discount_value: 50,
            valid_from: getPastDate(5),
            valid_to: getPastDate(1), // Expired
            is_active: true
        });

        // Try to apply
        await apiClient.post('/offers/validate', {
            code: offerExpCode,
            order_total: 200
        });
        console.error('❌ FAILED: Expired offer was applied successfully (BUG).');
    } catch (err) {
        if (err.response?.status === 400) {
            console.log('✅ Passed: Expired offer rejected.');
        } else {
            console.error('❌ Unexpected Error for Expired:', err.response?.data || err.message);
        }
    }

    // 5. Test Future Logic
    const offerFutCode = generateCode('OFFER_FUT');
    try {
        console.log(`\n5️⃣ Testing Future Offer Logic (${offerFutCode})...`);
        // Create offer starts tomorrow
        await apiClient.post('/offers', {
            code: offerFutCode,
            discount_type: 'fixed',
            discount_value: 50,
            valid_from: getFutureDate(1), // Starts tomorrow
            valid_to: getFutureDate(5),
            is_active: true
        });

        // Try to apply
        await apiClient.post('/offers/validate', {
            code: offerFutCode,
            order_total: 200
        });
        console.error('❌ FAILED: Future offer was applied successfully (BUG).');
    } catch (err) {
        if (err.response?.status === 400) {
            console.log('✅ Passed: Future offer rejected.');
        } else {
            console.error('❌ Unexpected Error for Future:', err.response?.data || err.message);
        }
    }

    // 6. Test Inactive Logic
    const offerInactiveCode = generateCode('OFFER_INA');
    try {
        console.log(`\n6️⃣ Testing Inactive Offer Logic (${offerInactiveCode})...`);
        // Create inactive offer
        await apiClient.post('/offers', {
            code: offerInactiveCode,
            discount_type: 'fixed',
            discount_value: 50,
            valid_from: getPastDate(1),
            valid_to: getFutureDate(5),
            is_active: false
        });

        // Try to apply
        await apiClient.post('/offers/validate', {
            code: offerInactiveCode,
            order_total: 200
        });
        console.error('❌ FAILED: Inactive offer was applied successfully (BUG).');
    } catch (err) {
        if (err.response?.status === 400) {
            console.log('✅ Passed: Inactive offer rejected.');
        } else {
            console.error('❌ Unexpected Error for Inactive:', err.response?.data || err.message);
        }
    }

    // 7. Negative Testing - Invalid Data (Expected to FAIL creation)
    console.log('\n7️⃣ Negative Validation Tests (Invalid Data)...');

    // 7a. End Date before Start Date
    const offerBadDates = generateCode('OFFER_BAD_DATE');
    try {
        console.log('   Testing End < Start...');
        await apiClient.post('/offers', {
            code: offerBadDates,
            discount_type: 'fixed',
            discount_value: 50,
            valid_from: getFutureDate(5),
            valid_to: getFutureDate(1), // End BEFORE Start
            is_active: true
        });
        console.error('❌ FAILED: Created offer with End < Start (BUG).');
    } catch (err) {
        console.log('✅ Passed: End < Start rejected.');
    }

    // 7b. Negative Value
    const offerNegVal = generateCode('OFFER_NEG');
    try {
        console.log('   Testing Negative Value...');
        await apiClient.post('/offers', {
            code: offerNegVal,
            discount_type: 'fixed',
            discount_value: -10, // Negative
            valid_from: getPastDate(1),
            valid_to: getFutureDate(1),
            is_active: true
        });
        console.error('❌ FAILED: Created offer with negative value (BUG).');
    } catch (err) {
        console.log('✅ Passed: Negative value rejected.');
    }

    // 7c. Percentage > 100
    const offerHighPerc = generateCode('OFFER_HIGH');
    try {
        console.log('   Testing > 100%...');
        await apiClient.post('/offers', {
            code: offerHighPerc,
            discount_type: 'percentage',
            discount_value: 150, // 150%
            valid_from: getPastDate(1),
            valid_to: getFutureDate(1),
            is_active: true
        });
        console.error('❌ FAILED: Created offer with >100% (BUG).');
    } catch (err) {
        console.log('✅ Passed: >100% value rejected.');
    }

    console.log('\n🎉 Offers Verification Completed!');
}

runVerification();
