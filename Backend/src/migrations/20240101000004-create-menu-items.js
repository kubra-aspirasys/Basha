'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('menu_items', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            description: {
                type: Sequelize.TEXT
            },
            price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0.00
            },
            category_id: {
                type: Sequelize.UUID,
                references: {
                    model: 'menu_categories',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            type_id: {
                type: Sequelize.UUID,
                references: {
                    model: 'menu_types',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            unit_type: {
                type: Sequelize.STRING,
                defaultValue: 'plate'
            },
            min_order_qty: {
                type: Sequelize.INTEGER,
                defaultValue: 1
            },
            max_order_qty: {
                type: Sequelize.INTEGER
            },
            stock_quantity: {
                type: Sequelize.INTEGER
            },
            preparation_time: {
                type: Sequelize.INTEGER,
                comment: 'in minutes'
            },
            is_vegetarian: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            },
            pre_order_time: {
                type: Sequelize.INTEGER,
                comment: 'in hours'
            },
            is_available: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            },
            is_featured: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            featured_priority: {
                type: Sequelize.INTEGER
            },
            offer_code: {
                type: Sequelize.STRING
            },
            offer_discount_type: {
                type: Sequelize.ENUM('percentage', 'fixed')
            },
            offer_discount_value: {
                type: Sequelize.DECIMAL(10, 2)
            },
            discounted_price: {
                type: Sequelize.DECIMAL(10, 2)
            },
            image_url: {
                type: Sequelize.TEXT
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

        await queryInterface.addIndex('menu_items', ['category_id']);
        await queryInterface.addIndex('menu_items', ['type_id']);
        await queryInterface.addIndex('menu_items', ['is_featured']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('menu_items');
    }
};
