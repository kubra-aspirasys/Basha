require('dotenv').config();
const { Customer } = require('./src/models');
const bcrypt = require('bcryptjs');

async function ensureCustomer() {
    try {
        const email = 'customer@bashafood.in';
        const password = 'customer123';
        
        console.log('Syncing Customer table to ensure it exists...');
        await Customer.sync();
        
        console.log('Searching for customer...');
        let customer = await Customer.findOne({ where: { email } });
        
        const password_hash = await bcrypt.hash(password, 10);
        
        if (customer) {
            console.log('Customer found, updating password...');
            customer.password_hash = password_hash;
            await customer.save();
        } else {
            console.log('Customer not found, creating new customer account...');
            customer = await Customer.create({
                name: 'Test Customer',
                email,
                phone: '9876543210',
                password_hash,
                is_active: true,
                is_blocked: false,
                role: 'customer'
            });
        }
        
        console.log(`\n🎉 Success! Customer created/updated successfully.`);
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Critical Error ensuring customer:', error);
        process.exit(1);
    }
}

ensureCustomer();
