'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        // 1. Drop old tables if they exist
        // Disable foreign key checks for dropping
        await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
        await queryInterface.dropTable('quotes');
        await queryInterface.dropTable('inquiries');
        await queryInterface.dropTable('contact_messages');
        await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

        // 2. Create the new Unified Contact Inquiries table
        await queryInterface.createTable('contact_inquiries', {
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
            phone: {
                type: Sequelize.STRING,
                allowNull: false
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false
            },
            subject: {
                type: Sequelize.STRING,
                allowNull: true
            },
            message: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            event_type: {
                type: Sequelize.STRING,
                allowNull: true
            },
            guest_count: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            status: {
                type: Sequelize.ENUM('Pending', 'Approved', 'Disapproved'),
                defaultValue: 'Pending',
                allowNull: false
            },
            internal_notes: {
                type: Sequelize.TEXT,
                allowNull: true
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
        await queryInterface.dropTable('contact_inquiries');
    }
};
