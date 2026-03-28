'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('offers', 'description', {
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'max_discount_value'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('offers', 'description');
  }
};
