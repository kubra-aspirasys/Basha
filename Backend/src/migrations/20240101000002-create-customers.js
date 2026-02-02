'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('customers', {
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
            email: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            password_hash: {
                type: Sequelize.STRING,
                allowNull: true // Can be null if created by admin or guest checkout initially
            },
            phone: {
                type: Sequelize.STRING
            },
            address: {
                type: Sequelize.TEXT
            },
            is_blocked: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            },
            last_activity: {
                type: Sequelize.DATE
            },
            avatar_url: {
                type: Sequelize.STRING
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

        await queryInterface.addIndex('customers', ['email']);
        await queryInterface.addIndex('customers', ['phone']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('customers');
    }
};
