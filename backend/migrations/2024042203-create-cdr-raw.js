'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('cdr_raw', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      globalCallId: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      dateTimeOrigination: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: 'Raw timestamp from CUCM'
      },
      callingPartyNumber: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      finalCalledPartyNumber: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      origDeviceName: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      lastRedirectDn: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      clientMatterCode: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      authCodeDescription: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      origCause_value: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      destCause_value: {
        type: Sequelize.INTEGER,
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
    await queryInterface.addIndex('cdr_raw', ['globalCallId'], { unique: true });
    await queryInterface.addIndex('cdr_raw', ['dateTimeOrigination']);
    await queryInterface.addIndex('cdr_raw', ['callingPartyNumber']);
    await queryInterface.addIndex('cdr_raw', ['finalCalledPartyNumber']);
    await queryInterface.addIndex('cdr_raw', ['origDeviceName']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('cdr_raw');
  }
};
