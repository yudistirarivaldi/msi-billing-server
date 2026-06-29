'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('master_users_extensions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      extension: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      department: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      cost_center: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      device_name: {
        type: Sequelize.STRING(255),
        allowNull: true
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
    await queryInterface.addIndex('master_users_extensions', ['extension']);
    await queryInterface.addIndex('master_users_extensions', ['device_name']);
    await queryInterface.addIndex('master_users_extensions', ['department']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('master_users_extensions');
  }
};
