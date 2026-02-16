'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        return queryInterface.changeColumn('orders', 'status', {
            type: Sequelize.ENUM('pending', 'confirmed', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled'),
            defaultValue: 'pending',
            allowNull: true // Keeping existing constraints if any
        });
    },

    down: async (queryInterface, Sequelize) => {
        return queryInterface.changeColumn('orders', 'status', {
            type: Sequelize.ENUM('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'),
            defaultValue: 'pending'
        });
    }
};
