'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('master_users_extensions', 'department_id');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('master_users_extensions', 'department_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'master_departments',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  }
};
