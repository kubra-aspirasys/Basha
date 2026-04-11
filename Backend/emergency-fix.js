require('dotenv').config();
const { sequelize, User, Customer } = require('./src/models');
const bcrypt = require('bcryptjs');

async function runFix() {
    try {
        console.log("--- STARTING EMERGENCY DATABASE REPAIR ---");

        // 1. CLEAN UP REDUNDANT KEYS (Fixes the PM2 crash)
        console.log("\n1. Cleaning up blog_posts indices...");
        try {
            const [indices] = await sequelize.query("SHOW INDEX FROM blog_posts");
            const slugIndices = indices.filter(idx => idx.Column_name === 'slug' && idx.Key_name !== 'PRIMARY');
            console.log(`Found ${slugIndices.length} slug indices.`);
            
            for (let i = 1; i < slugIndices.length; i++) {
                const indexName = slugIndices[i].Key_name;
                console.log(`Dropping index: ${indexName}`);
                await sequelize.query(`ALTER TABLE blog_posts DROP INDEX \`${indexName}\``);
            }
        } catch (e) {
            console.warn("Could not clean indices (table might not exist or error):", e.message);
        }

        // 2. FORCE SYNC USER TABLE (Fixes the 'is_blocked' error)
        console.log("\n2. Force-syncing User model structure...");
        // This will add missing columns like 'is_blocked'
        await User.sync({ alter: true });
        console.log("User table structure updated.");

        // 3. SEED THE ADMIN USER
        console.log("\n3. Seeding admin account...");
        const email = 'admin@bashafood.in';
        const password_hash = await bcrypt.hash('admin123', 10);

        let user = await User.findOne({ where: { email } });
        if (user) {
            console.log("User found, updating role and password...");
            await User.update({ 
                role: 'superadmin', 
                password_hash,
                is_blocked: false 
            }, { 
                where: { id: user.id } 
            });
            console.log("Updated existing admin account.");
        } else {
            console.log("User not found, creating new superadmin...");
            await User.create({
                name: 'Super Admin',
                email,
                phone: '1234567890',
                role: 'superadmin',
                password_hash,
                is_blocked: false
            });
            console.log("Created new superadmin account.");
        }

        console.log("\n--- REPAIR COMPLETE! ---");
        console.log("You can now login with: admin@bashafood.in / admin123");
        process.exit(0);
    } catch (error) {
        console.error("\nCRITICAL ERROR DURING REPAIR:", error);
        process.exit(1);
    }
}

runFix();
