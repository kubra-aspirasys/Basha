const { MenuCategory, sequelize } = require('./src/models');

const updates = {
    'Barbeque Kababs': 8,
    'BBQ Chicken Wraps': 9,
    'BBQ Chicken Hotdog': 10,
    'Sausy Delicacies': 11,
    'Royal Desserts': 12,
    'Desserts': 20, // Move generic Desserts to after Royal Desserts or keep similar
    'Briyani': 15, // Push duplicate/typo down
    'Biryani': 1,
    'Curries & Gravies': 2,
    'Rice Varieties': 3,
    'Breads': 4,
    'Starters': 5,
    'Beverages': 6
};

const reorder = async () => {
    try {
        await sequelize.authenticate();
        console.log('connected');

        for (const [name, order] of Object.entries(updates)) {
            await MenuCategory.update(
                { display_order: order },
                { where: { name: name } }
            );
            console.log(`Updated ${name} to order ${order}`);
        }
        console.log('Reordering Done');
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

reorder();
