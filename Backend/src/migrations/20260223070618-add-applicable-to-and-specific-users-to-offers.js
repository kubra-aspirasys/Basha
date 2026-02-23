'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('offers', 'applicable_to', {
      type: Sequelize.ENUM('all', 'specific'),
      defaultValue: 'all',
      allowNull: false
    });
    await queryInterface.addColumn('offers', 'specific_users', {
      type: Sequelize.JSON,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('offers', 'specific_users');
    await queryInterface.removeColumn('offers', 'applicable_to');
  }
};
