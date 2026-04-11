require('dotenv').config();
const { sequelize, User, Customer } = require('./src/models');
const bcrypt = require('bcryptjs');

async function seedAll() {
    try {
        console.log("--- STARTING DATABASE SYNC AND SEED ---");

        // Force Sync Both Tables
        console.log("Syncing Tables...");
        await User.sync({ alter: true });
        await Customer.sync({ alter: true });
        console.log("Tables synced successfully.");

        // Hash Passwords
        const adminHash = await bcrypt.hash('admin123', 10);
        const customerHash = await bcrypt.hash('customer123', 10);

        // 1. Create/Update Admin
        console.log("Seeding Admin...");
        const adminEmail = 'admin@bashafood.in';
        let admin = await User.findOne({ where: { email: adminEmail } });
        if (admin) {
            await admin.update({ role: 'superadmin', password_hash: adminHash });
            console.log("Admin updated.");
        } else {
            await User.create({ name: 'Super Admin', email: adminEmail, role: 'superadmin', password_hash: adminHash, phone: '1234567890' });
            console.log("Admin created.");
        }

        // 2. Create/Update Customer
        console.log("Seeding Customer...");
        const custEmail = 'customer@bashafood.in';
        let customer = await Customer.findOne({ where: { email: custEmail } });
        if (customer) {
            await customer.update({ password_hash: customerHash, is_active: true });
            console.log("Customer updated.");
        } else {
            await Customer.create({ name: 'Test Customer', email: custEmail, password_hash: customerHash, phone: '9876543210', is_active: true, is_blocked: false });
            console.log("Customer created.");
        }

        console.log("\n--- EVERYTHING READY! ---");
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}
seedAll();
