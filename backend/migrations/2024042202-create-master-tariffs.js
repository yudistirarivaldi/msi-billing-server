'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('master_tariffs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      prefix: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      description: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      rate_per_second: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: false,
        defaultValue: 0.0000
      },
      call_type: {
        type: Sequelize.ENUM('Internal', 'National', 'International', 'OnNet', 'OffNet'),
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for better query performance
    await queryInterface.addIndex('master_tariffs', ['prefix']);
    await queryInterface.addIndex('master_tariffs', ['call_type']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('master_tariffs');
  }
};
