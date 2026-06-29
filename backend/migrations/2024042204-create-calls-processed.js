'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('calls_processed', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      call_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'cdr_raw',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      normalized_time: {
        type: Sequelize.DATE,
        allowNull: false
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Duration in seconds'
      },
      caller_extension: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      destination_number: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      call_type: {
        type: Sequelize.ENUM('Internal', 'National', 'International', 'OnNet', 'OffNet'),
        allowNull: false
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'master_users_extensions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      cost: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: false,
        defaultValue: 0.0000
      },
      cmc_fac_code: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Client Matter Code / Facility Code'
      },
      status: {
        type: Sequelize.ENUM('Normal', 'Abnormal'),
        allowNull: false,
        defaultValue: 'Normal'
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
    await queryInterface.addIndex('calls_processed', ['call_id'], { unique: true });
    await queryInterface.addIndex('calls_processed', ['normalized_time']);
    await queryInterface.addIndex('calls_processed', ['caller_extension']);
    await queryInterface.addIndex('calls_processed', ['destination_number']);
    await queryInterface.addIndex('calls_processed', ['call_type']);
    await queryInterface.addIndex('calls_processed', ['user_id']);
    await queryInterface.addIndex('calls_processed', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('calls_processed');
  }
};
