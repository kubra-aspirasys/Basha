
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let token = '';
let createdMenuItemId = '';
let categoryId = '';
let typeId = '';

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
            console.error('[FAIL] Login failed: No token received');
            process.exit(1);
        }
    } catch (error) {
        console.error('[FAIL] Login error:', error.response ? error.response.data : error.message);
        process.exit(1);
    }
};

const getHeaders = () => ({
    headers: { Authorization: `Bearer ${token}` }
});

const listCategories = async () => {
    try {
        console.log('Fetching categories...');
        const response = await axios.get(`${BASE_URL}/menu/categories`, getHeaders());
        if (response.data.success && response.data.data.length > 0) {
            categoryId = response.data.data[0].id; // Use first category
            console.log(`[PASS] Categories listed. Using Category ID: ${categoryId}`);
        } else {
            console.log('[WARN] No categories found. Tests requiring category might fail.');
        }
    } catch (error) {
        console.error('[FAIL] List categories error:', error.message);
    }
};

const createMenuItem = async () => {
    try {
        console.log('Creating menu item...');
        if (!categoryId) {
            console.log('[SKIP] Skipping creation, no category ID available.');
            return;
        }
        const payload = {
            name: `Test Item ${Date.now()}`,
            description: 'Test Description',
            price: 150.00,
            category_id: categoryId,
            unit_type: 'plate',
            min_order_qty: 1,
            is_available: true,
            is_vegetarian: true
        };
        const response = await axios.post(`${BASE_URL}/menu`, payload, getHeaders());
        if (response.data.success) {
            createdMenuItemId = response.data.data.id;
            console.log(`[PASS] Menu Item Created. ID: ${createdMenuItemId}`);
        } else {
            console.error('[FAIL] Create menu item failed');
        }
    } catch (error) {
        console.error('[FAIL] Create menu item error:', error.response ? error.response.data : error.message);
    }
};

const listMenuItems = async () => {
    try {
        console.log('Listing menu items...');
        const response = await axios.get(`${BASE_URL}/menu?limit=5`, getHeaders());
        if (response.data.success) {
            console.log(`[PASS] Menu items listed. Count: ${response.data.data.length}`);
        } else {
            console.error('[FAIL] List menu items failed');
        }
    } catch (error) {
        console.error('[FAIL] List menu items error:', error.message);
    }
};

const updateMenuItem = async () => {
    if (!createdMenuItemId) return;
    try {
        console.log('Updating menu item...');
        const payload = {
            price: 180.00,
            description: 'Updated Description'
        };
        const response = await axios.put(`${BASE_URL}/menu/${createdMenuItemId}`, payload, getHeaders());
        if (response.data.success && response.data.data.price == 180.00) {
            console.log('[PASS] Menu Item Updated');
        } else {
            console.error('[FAIL] Update menu item failed');
        }
    } catch (error) {
        console.error('[FAIL] Update menu item error:', error.message);
    }
};

const deleteMenuItem = async () => {
    if (!createdMenuItemId) return;
    try {
        console.log('Deleting menu item...');
        const response = await axios.delete(`${BASE_URL}/menu/${createdMenuItemId}`, getHeaders());
        if (response.data.success) {
            console.log('[PASS] Menu Item Deleted');
        } else {
            console.error('[FAIL] Delete menu item failed');
        }
    } catch (error) {
        console.error('[FAIL] Delete menu item error:', error.message);
    }
};

const run = async () => {
    await login();
    await listCategories();
    await createMenuItem();
    await listMenuItems();
    await updateMenuItem();
    await deleteMenuItem();
};

run();
