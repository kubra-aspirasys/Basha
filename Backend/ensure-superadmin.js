require('dotenv').config();
const db = require('./src/models');
const bcrypt = require('bcryptjs');

async function ensureSuperAdmin() {
    try {
        const email = 'admin@bashafood.in';
        console.log('Syncing User table to ensure it exists...');
        
        // Sync only the User model specifically to bypass any global sync issues
        await db.User.sync();
        
        console.log('Searching for user...');
        let user = await db.User.findOne({ where: { email } });
        
        // Default password to hash
        const password_hash = await bcrypt.hash('admin123', 10);
        
        if (user) {
            console.log('User found in User table, updating role and password...');
            user.role = 'superadmin';
            user.password_hash = password_hash; // Force update password too
            await user.save();
        } else {
            console.log('Checking for user in Customer table...');
            const customer = await db.Customer.findOne({ where: { email } });
            if (customer) {
                console.log('User found in Customer table, migrating to User table as superadmin...');
                user = await db.User.create({
                    name: customer.name || 'Super Admin',
                    email: customer.email,
                    phone: customer.phone || '1234567890',
                    role: 'superadmin',
                    password_hash
                });
            } else {
                console.log('User not found anywhere, creating new superadmin...');
                user = await db.User.create({
                    name: 'Super Admin',
                    email,
                    phone: '1234567890',
                    role: 'superadmin',
                    password_hash
                });
            }
        }
        console.log(`\n🎉 Success! Superadmin created/updated successfully.`);
        console.log(`Email: ${email}`);
        console.log(`Password: admin123`);
        
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Critical Error ensuring superadmin:', error);
        process.exit(1);
    }
}

ensureSuperAdmin();
