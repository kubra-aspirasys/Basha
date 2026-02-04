'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('payments', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true
            },
            transaction_id: {
                type: Sequelize.STRING(50),
                allowNull: false,
                unique: true
            },
            order_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'orders',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            customer_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'customers',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            customer_name: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            amount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false
            },
            payment_mode: {
                type: Sequelize.ENUM('cash', 'upi', 'card', 'netbanking'),
                defaultValue: 'cash'
            },
            status: {
                type: Sequelize.ENUM('pending', 'completed', 'failed', 'refunded'),
                defaultValue: 'pending'
            },
            notes: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            payment_reference: {
                type: Sequelize.STRING(100),
                allowNull: true
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            deleted_at: {
                type: Sequelize.DATE,
                allowNull: true
            }
        });

        // Add indexes for better query performance
        await queryInterface.addIndex('payments', ['transaction_id']);
        await queryInterface.addIndex('payments', ['order_id']);
        await queryInterface.addIndex('payments', ['customer_id']);
        await queryInterface.addIndex('payments', ['status']);
        await queryInterface.addIndex('payments', ['payment_mode']);
        await queryInterface.addIndex('payments', ['created_at']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('payments');
    }
};
