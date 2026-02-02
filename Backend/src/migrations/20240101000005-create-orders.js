'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Orders Table
        await queryInterface.createTable('orders', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
            },
            order_number: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            customer_id: {
                type: Sequelize.UUID,
                references: {
                    model: 'customers',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
                allowNull: true // Guest checkout
            },
            customer_name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            customer_phone: {
                type: Sequelize.STRING
            },
            delivery_address: {
                type: Sequelize.TEXT
            },
            total_amount: {
                type: Sequelize.DECIMAL(10, 2),
                defaultValue: 0.00
            },
            subtotal: {
                type: Sequelize.DECIMAL(10, 2),
                defaultValue: 0.00
            },
            gst_amount: {
                type: Sequelize.DECIMAL(10, 2),
                defaultValue: 0.00
            },
            delivery_charges: {
                type: Sequelize.DECIMAL(10, 2),
                defaultValue: 0.00
            },
            service_charges: {
                type: Sequelize.DECIMAL(10, 2),
                defaultValue: 0.00
            },
            status: {
                type: Sequelize.ENUM('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'),
                defaultValue: 'pending'
            },
            order_type: {
                type: Sequelize.ENUM('pickup', 'delivery'),
                defaultValue: 'delivery'
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
                type: Sequelize.DATE,
                allowNull: true
            }
        });

        // Order Items Table
        await queryInterface.createTable('order_items', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
            },
            order_id: {
                type: Sequelize.UUID,
                references: {
                    model: 'orders',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            menu_item_id: {
                type: Sequelize.UUID,
                references: {
                    model: 'menu_items',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            menu_item_name: {
                type: Sequelize.STRING, // Store name in case menu item is deleted/changed
                allowNull: false
            },
            quantity: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 1
            },
            price: {
                type: Sequelize.DECIMAL(10, 2), // Price at time of order
                allowNull: false
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
            }
        });

        await queryInterface.addIndex('orders', ['order_number']);
        await queryInterface.addIndex('orders', ['customer_id']);
        await queryInterface.addIndex('order_items', ['order_id']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('order_items');
        await queryInterface.dropTable('orders');
    }
};
