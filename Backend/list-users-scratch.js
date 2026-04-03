const db = require('./src/models');

async function listUsers() {
    try {
        const users = await db.User.findAll({ attributes: ['email', 'role'] });
        const customers = await db.Customer.findAll({ attributes: ['email'] });
        console.log('--- Users ---');
        console.log(JSON.stringify(users, null, 2));
        console.log('--- Customers ---');
        console.log(JSON.stringify(customers, null, 2));
        process.exit(0);
    } catch (error) {
        console.error('Error listing users:', error);
        process.exit(1);
    }
}

listUsers();
