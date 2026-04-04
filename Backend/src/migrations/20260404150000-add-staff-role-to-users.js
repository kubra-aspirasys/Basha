'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Alter the role ENUM to include 'staff'
    await queryInterface.changeColumn('users', 'role', {
      type: Sequelize.ENUM('admin', 'staff'),
      defaultValue: 'admin',
      allowNull: false
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert back to admin only
    await queryInterface.changeColumn('users', 'role', {
      type: Sequelize.ENUM('admin'),
      defaultValue: 'admin',
      allowNull: false
    });
  }
};
