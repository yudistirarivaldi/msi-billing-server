'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CallsProcessed extends Model {}

  CallsProcessed.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    call_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'cdr_raw',
        key: 'id'
      }
    },
    normalized_time: {
      type: DataTypes.DATE,
      allowNull: false
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    caller_extension: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    destination_number: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    call_type: {
      type: DataTypes.ENUM('Internal', 'National', 'International', 'OnNet', 'OffNet'),
      allowNull: false
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'master_users_extensions',
        key: 'id'
      }
    },
    cost: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
      defaultValue: 0.0000
    },
    cmc_fac_code: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'Normal'
    }
  }, {
    sequelize,
    modelName: 'callsprocessed',
    tableName: 'calls_processed',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['normalized_time']
      },
      {
        fields: ['caller_extension']
      },
      {
        fields: ['user_id']
      },
      {
        fields: ['call_type']
      },
      {
        fields: ['status']
      }
    ]
  });

  CallsProcessed.associate = function(models) {
    // Gunakan huruf kecil sesuai modelName di masing-masing file
    CallsProcessed.belongsTo(models.masterusersextension, {
      foreignKey: 'user_id',
      as: 'user'
    });
    CallsProcessed.belongsTo(models.cdrraw, {
      foreignKey: 'call_id',
      as: 'cdr_raw'
    });
  };

  return CallsProcessed;
};
