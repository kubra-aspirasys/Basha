'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('customers', 'address_type', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: 'Home'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('customers', 'address_type');
  }
};
