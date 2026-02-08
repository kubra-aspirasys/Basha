const { MenuCategory, MenuType, sequelize } = require('./src/models');

const categories = [
    { name: 'Biryani', display_order: 1 },
    { name: 'Curries & Gravies', display_order: 2 },
    { name: 'Rice Varieties', display_order: 3 },
    { name: 'Breads', display_order: 4 },
    { name: 'Starters', display_order: 5 },
    { name: 'Desserts', display_order: 6 },
    { name: 'Beverages', display_order: 7 }
];

const types = [
    { name: 'Veg', color: '#10B981' },      // Green
    { name: 'Non-Veg', color: '#EF4444' },  // Red
    { name: 'Egg', color: '#F59E0B' },      // Yellow
    { name: 'Vegan', color: '#10B981' }     // Green
];

const seedData = async () => {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Database connection established successfully.');

        // Seed Categories
        console.log('Seeding Categories...');
        for (const cat of categories) {
            const slug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            await MenuCategory.findOrCreate({
                where: { name: cat.name },
                defaults: { ...cat, slug, is_active: true }
            });
        }
        console.log('Categories seeded.');

        // Seed Types
        console.log('Seeding Types...');
        for (const type of types) {
            const slug = type.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            await MenuType.findOrCreate({
                where: { name: type.name },
                defaults: { ...type, slug }
            });
        }
        console.log('Types seeded.');

        console.log('Seeding completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Unable to seed data:', error);
        process.exit(1);
    }
};

seedData();
