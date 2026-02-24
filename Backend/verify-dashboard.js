const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let token = '';

const login = async () => {
    try {
        const response = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@bashabiryani.com',
            password: 'admin123'
        });
        token = response.data.data.token;
        console.log('✅ Logged in successfully');
    } catch (error) {
        console.error('❌ Login failed:', error.response?.data?.message || error.message);
    }
};

const testDashboardStats = async () => {
    try {
        const start = Date.now();
        const response = await axios.get(`${BASE_URL}/dashboard/stats`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const duration = Date.now() - start;
        console.log(`✅ Dashboard stats retrieved in ${duration}ms`);
        console.log('Data summary:', {
            totalCustomers: response.data.data.totalCustomers,
            totalOrders: response.data.data.totalOrders,
            totalRevenue: response.data.data.totalRevenue,
            topSellingItems: response.data.data.topSellingItems.length,
            recentOrders: response.data.data.recentOrders.length
        });
    } catch (error) {
        console.error('❌ Failed to fetch dashboard stats:', error.response?.data?.message || error.message);
    }
};

const testSecurity = async () => {
    console.log('\n--- Security Testing ---');
    try {
        await axios.get(`${BASE_URL}/dashboard/stats`);
        console.log('❌ Security Flaw: Dashboard stats accessible without token!');
    } catch (error) {
        console.log('✅ Security Pass: Dashboard stats inaccessible without token (401 expected)');
    }
};

const runTests = async () => {
    await login();
    if (token) {
        await testDashboardStats();
        await testSecurity();
    }
};

runTests();
