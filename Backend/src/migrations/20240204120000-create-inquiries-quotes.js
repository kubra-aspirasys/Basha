'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        // Create Inquiries Table
        await queryInterface.createTable('inquiries', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
            },
            full_name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            email: {
                type: Sequelize.STRING
            },
            phone: {
                type: Sequelize.STRING
            },
            event_date: {
                type: Sequelize.DATEONLY
            },
            event_type: {
                type: Sequelize.STRING
            },
            guest_count: {
                type: Sequelize.INTEGER
            },
            additional_details: {
                type: Sequelize.TEXT
            },
            status: {
                type: Sequelize.ENUM('new', 'contacted', 'quoted', 'converted', 'closed'),
                defaultValue: 'new'
            },
            priority: {
                type: Sequelize.ENUM('low', 'medium', 'high'),
                defaultValue: 'medium'
            },
            assigned_to: {
                type: Sequelize.STRING
            },
            notes: {
                type: Sequelize.TEXT
            },
            quote_amount: {
                type: Sequelize.DECIMAL(10, 2)
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

        // Create Quotes Table
        await queryInterface.createTable('quotes', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
            },
            inquiry_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'inquiries',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            amount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0.00
            },
            details: {
                type: Sequelize.TEXT
            },
            valid_until: {
                type: Sequelize.DATEONLY
            },
            status: {
                type: Sequelize.ENUM('draft', 'sent', 'accepted', 'rejected', 'expired'),
                defaultValue: 'draft'
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
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('quotes');
        await queryInterface.dropTable('inquiries');
    }
};
