'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // For MySQL, we need to alter the ENUM to add new values
        await queryInterface.changeColumn('orders', 'order_type', {
            type: Sequelize.ENUM('pickup', 'delivery', 'swiggy', 'zomato', 'takeaway'),
            defaultValue: 'delivery',
            allowNull: true
        });
    },

    down: async (queryInterface, Sequelize) => {
        // Revert back to original enum values
        // Note: This will fail if any rows have the new values
        await queryInterface.changeColumn('orders', 'order_type', {
            type: Sequelize.ENUM('pickup', 'delivery'),
            defaultValue: 'delivery'
        });
    }
};
