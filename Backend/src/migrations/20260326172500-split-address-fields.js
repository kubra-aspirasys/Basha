'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('customers', 'house_address', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await queryInterface.addColumn('customers', 'street', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('customers', 'locality', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('customers', 'city', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: 'Ambur'
    });
    // Optional: We could keep the address column or remove it. For now let's keep it to avoid data loss during the transition.
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('customers', 'house_address');
    await queryInterface.removeColumn('customers', 'street');
    await queryInterface.removeColumn('customers', 'locality');
    await queryInterface.removeColumn('customers', 'city');
  }
};
