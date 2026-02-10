const { MenuCategory, sequelize } = require('./src/models');

const checkCategories = async () => {
    try {
        await sequelize.authenticate();
        const categories = await MenuCategory.findAll({
            order: [['display_order', 'ASC'], ['name', 'ASC']]
        });

        console.log('Current Categories match display_order:');
        categories.forEach(c => {
            console.log(`${c.name}: ${c.display_order}`);
        });
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkCategories();
