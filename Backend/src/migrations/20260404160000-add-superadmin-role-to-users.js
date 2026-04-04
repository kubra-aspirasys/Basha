'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Alter the role ENUM to include 'superadmin'
    await queryInterface.changeColumn('users', 'role', {
      type: Sequelize.ENUM('superadmin', 'admin', 'staff'),
      defaultValue: 'admin',
      allowNull: false
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert back
    await queryInterface.changeColumn('users', 'role', {
      type: Sequelize.ENUM('admin', 'staff'),
      defaultValue: 'admin',
      allowNull: false
    });
  }
};
