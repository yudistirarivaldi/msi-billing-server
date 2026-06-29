'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Fix cdr_raw table validations
    await queryInterface.changeColumn('cdr_raw', 'globalCallId', {
      type: Sequelize.STRING(100),
      allowNull: true,
      unique: true
    });

    await queryInterface.changeColumn('cdr_raw', 'callingPartyNumber', {
      type: Sequelize.STRING(50),
      allowNull: true
    });

    await queryInterface.changeColumn('cdr_raw', 'finalCalledPartyNumber', {
      type: Sequelize.STRING(50),
      allowNull: true
    });

    // Fix calls_processed table validations
    await queryInterface.changeColumn('calls_processed', 'caller_extension', {
      type: Sequelize.STRING(50),
      allowNull: true
    });

    await queryInterface.changeColumn('calls_processed', 'destination_number', {
      type: Sequelize.STRING(50),
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert cdr_raw table validations
    await queryInterface.changeColumn('cdr_raw', 'globalCallId', {
      type: Sequelize.STRING(100),
      allowNull: false,
      unique: true
    });

    await queryInterface.changeColumn('cdr_raw', 'callingPartyNumber', {
      type: Sequelize.STRING(50),
      allowNull: false
    });

    await queryInterface.changeColumn('cdr_raw', 'finalCalledPartyNumber', {
      type: Sequelize.STRING(50),
      allowNull: false
    });

    // Revert calls_processed table validations
    await queryInterface.changeColumn('calls_processed', 'caller_extension', {
      type: Sequelize.STRING(50),
      allowNull: false
    });

    await queryInterface.changeColumn('calls_processed', 'destination_number', {
      type: Sequelize.STRING(50),
      allowNull: false
    });
  }
};
