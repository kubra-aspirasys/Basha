'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('offers', 'item_applicability', {
      type: Sequelize.ENUM('all', 'specific'),
      defaultValue: 'all',
      allowNull: false
    });
    await queryInterface.addColumn('offers', 'specific_items', {
      type: Sequelize.JSON,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('offers', 'specific_items');
    await queryInterface.removeColumn('offers', 'item_applicability');
    // Drop logic for enum? Sequelize might handle it. ENUM depends on DB. Usually we don't drop types in safe migrations.
  }
};
