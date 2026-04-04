require('dotenv').config();
const db = require('./src/models');
async function listUsers() {
    try {
        const users = await db.User.findAll();
        const customers = await db.Customer.findAll();
        console.log('--- USERS ---');
        users.forEach(u => console.log(`${u.email} (${u.role})`));
        console.log('--- CUSTOMERS ---');
        customers.forEach(c => console.log(`${c.email} (${c.role})`));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
listUsers();
