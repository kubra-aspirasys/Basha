'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('offers', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
                allowNull: false
            },
            code: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            discount_type: {
                type: Sequelize.ENUM('percentage', 'fixed'),
                allowNull: false,
                defaultValue: 'percentage'
            },
            discount_value: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false
            },
            valid_from: {
                type: Sequelize.DATE,
                allowNull: false
            },
            valid_to: {
                type: Sequelize.DATE,
                allowNull: false
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            deleted_at: {
                type: Sequelize.DATE
            }
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('offers');
    }
};
