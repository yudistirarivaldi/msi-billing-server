'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('master_departments', 'monthly_quota');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('master_departments', 'monthly_quota', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });
  }
};
