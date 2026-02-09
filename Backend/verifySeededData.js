const { MenuCategory, MenuType, sequelize } = require('./src/models');

const verifyData = async () => {
    try {
        await sequelize.authenticate();

        const categories = await MenuCategory.findAll();
        const types = await MenuType.findAll();

        console.log(`Found ${categories.length} Categories:`, categories.map(c => c.name));
        console.log(`Found ${types.length} Types:`, types.map(t => t.name));

        process.exit(0);
    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
};

verifyData();
