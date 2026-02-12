'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('used_coupons', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
                allowNull: false
            },
            order_id: {
                type: Sequelize.STRING, // Assuming order_id is string/UUID from other tables
                allowNull: false
            },
            offer_id: {
                type: Sequelize.UUID,
                allowNull: false
            },
            customer_id: {
                type: Sequelize.UUID,
                allowNull: true
            },
            discount_amount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });

        // Add indexes for better query performance
        await queryInterface.addIndex('used_coupons', ['order_id']);
        await queryInterface.addIndex('used_coupons', ['offer_id']);
        await queryInterface.addIndex('used_coupons', ['customer_id']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('used_coupons');
    }
};
