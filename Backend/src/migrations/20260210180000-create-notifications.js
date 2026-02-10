'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('notifications', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
            },
            type: {
                type: Sequelize.ENUM(
                    'new_order', 'order_status', 'order_cancelled',
                    'new_payment', 'payment_failed',
                    'new_customer', 'new_inquiry',
                    'low_stock', 'system', 'info'
                ),
                allowNull: false,
                defaultValue: 'info'
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false
            },
            message: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            is_read: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            priority: {
                type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'),
                defaultValue: 'medium'
            },
            reference_id: {
                type: Sequelize.UUID,
                allowNull: true,
                comment: 'ID of the related entity (order, customer, etc.)'
            },
            reference_type: {
                type: Sequelize.STRING,
                allowNull: true,
                comment: 'Type of the related entity: order, customer, inquiry, payment'
            },
            metadata: {
                type: Sequelize.JSON,
                allowNull: true,
                comment: 'Additional data like order_number, customer_name, amount, etc.'
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            deleted_at: {
                type: Sequelize.DATE
            }
        });

        // Add indexes for performance
        await queryInterface.addIndex('notifications', ['is_read']);
        await queryInterface.addIndex('notifications', ['type']);
        await queryInterface.addIndex('notifications', ['created_at']);
        await queryInterface.addIndex('notifications', ['reference_id', 'reference_type']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('notifications');
    }
};
