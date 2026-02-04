'use strict';
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const adminPassword = await bcrypt.hash('admin123', 10);
        const customerPassword = await bcrypt.hash('customer123', 10);

        // Seed Admin User
        await queryInterface.bulkInsert('users', [{
            id: uuidv4(),
            name: 'Admin User',
            email: 'admin@bashabiryani.com',
            password_hash: adminPassword,
            phone: '9876543200',
            role: 'admin',
            created_at: new Date(),
            updated_at: new Date()
        }], {});

        // Seed Customer User
        await queryInterface.bulkInsert('customers', [{
            id: uuidv4(),
            name: 'Demo Customer',
            email: 'customer@bashabiryani.com',
            password_hash: customerPassword,
            phone: '9876543210',
            address: '123 Main Street, Hyderabad',
            is_blocked: false,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date()
        }], {});
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('users', { email: 'admin@bashabiryani.com' }, {});
        await queryInterface.bulkDelete('customers', { email: 'customer@bashabiryani.com' }, {});
    }
};
