require('dotenv').config();
const db = require('./src/models');
const bcrypt = require('bcryptjs');

async function ensureSuperAdmin() {
    try {
        const email = 'admin@bashafood.in';
        console.log('Searching for user...');
        let user = await db.User.findOne({ where: { email } });
        
        if (user) {
            console.log('User found in User table, updating role...');
            user.role = 'superadmin';
            await user.save();
        } else {
            console.log('User not found in User table, checking Customer table...');
            const customer = await db.Customer.findOne({ where: { email } });
            if (customer) {
                console.log('User found in Customer table, migrating to User table as superadmin...');
                user = await db.User.create({
                    name: customer.name,
                    email: customer.email,
                    phone: customer.phone,
                    role: 'superadmin',
                    password_hash: customer.password_hash
                });
                // await customer.destroy(); // Keep it there or delete it? Let's hide it from admin view.
            } else {
                console.log('User not found anywhere, creating new superadmin...');
                const password_hash = await bcrypt.hash('admin123', 10);
                user = await db.User.create({
                    name: 'Super Admin',
                    email,
                    phone: '1234567890',
                    role: 'superadmin',
                    password_hash
                });
            }
        }
        console.log(`User ${email} is now a superadmin.`);
        process.exit(0);
    } catch (error) {
        console.error('Error ensuring superadmin:', error);
        process.exit(1);
    }
}

ensureSuperAdmin();
