const bcrypt = require('bcryptjs');
const db = require('./src/models');

async function fixPasswords() {
    try {
        const adminPassword = await bcrypt.hash('admin123', 10);
        const customerPassword = await bcrypt.hash('customer123', 10);

        const [admin, adminCreated] = await db.User.findOrCreate({
            where: { email: 'admin@bashabiryani.com' },
            defaults: {
                name: 'Admin User',
                password_hash: adminPassword,
                phone: '9876543200',
                role: 'admin'
            }
        });

        if (!adminCreated) {
            await admin.update({ password_hash: adminPassword });
            console.log('Admin password updated');
        } else {
            console.log('Admin created');
        }

        const [customer, customerCreated] = await db.Customer.findOrCreate({
            where: { email: 'customer@bashabiryani.com' },
            defaults: {
                name: 'Demo Customer',
                password_hash: customerPassword,
                phone: '9876543210',
                address: '123 Main Street, Hyderabad',
                is_blocked: false,
                is_active: true
            }
        });

        if (!customerCreated) {
            await customer.update({ password_hash: customerPassword });
            console.log('Customer password updated');
        } else {
            console.log('Customer created');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error fixing passwords:', error);
        process.exit(1);
    }
}

fixPasswords();
