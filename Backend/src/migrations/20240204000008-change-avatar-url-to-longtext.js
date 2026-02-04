'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('users', 'avatar_url', {
            type: Sequelize.TEXT('long'),
            allowNull: true
        });
        await queryInterface.changeColumn('customers', 'avatar_url', {
            type: Sequelize.TEXT('long'),
            allowNull: true
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('users', 'avatar_url', {
            type: Sequelize.STRING,
            allowNull: true
        });
        await queryInterface.changeColumn('customers', 'avatar_url', {
            type: Sequelize.STRING,
            allowNull: true
        });
    }
};
