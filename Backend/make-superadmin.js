require('dotenv').config();
const db = require('./src/models');

async function makeSuperAdmin() {
    try {
        const email = 'admin@bashafood.in';
        console.log('Searching for user...');
        const user = await db.User.findOne({ where: { email: email } });
        if (!user) {
            console.error(`User with email ${email} not found.`);
            process.exit(1);
        }
        console.log('Updating role...');
        user.role = 'superadmin';
        await user.save();
        console.log(`User ${email} is now a superadmin.`);
        process.exit(0);
    } catch (error) {
        console.error('Error making superadmin:', error);
        process.exit(1);
    }
}

makeSuperAdmin();
