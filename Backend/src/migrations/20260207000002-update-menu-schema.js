'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Add icon to menu_categories if it doesn't exist
        const categoriesTable = await queryInterface.describeTable('menu_categories');
        if (!categoriesTable.icon) {
            await queryInterface.addColumn('menu_categories', 'icon', {
                type: Sequelize.STRING,
                allowNull: true
            });
        }

        // Add is_vegetarian to menu_items if it doesn't exist
        const itemsTable = await queryInterface.describeTable('menu_items');
        if (!itemsTable.is_vegetarian) {
            await queryInterface.addColumn('menu_items', 'is_vegetarian', {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            });
        }

        // Change image_url to TEXT in menu_items
        if (itemsTable.image_url) {
            await queryInterface.changeColumn('menu_items', 'image_url', {
                type: Sequelize.TEXT,
                allowNull: true
            });
        }
    },

    down: async (queryInterface, Sequelize) => {
        // We can revert these changes or leave them. 
        // Reverting changeColumn might be tricky if data is long.
        const itemsTable = await queryInterface.describeTable('menu_items');
        if (itemsTable.is_vegetarian) {
            await queryInterface.removeColumn('menu_items', 'is_vegetarian');
        }
        const categoriesTable = await queryInterface.describeTable('menu_categories');
        if (categoriesTable.icon) {
            await queryInterface.removeColumn('menu_categories', 'icon');
        }
    }
};
