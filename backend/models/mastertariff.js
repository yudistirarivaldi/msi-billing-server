'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class MasterTariff extends Model {
    static associate(models) {
      // Define associations here if needed
    }
  }

  MasterTariff.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    prefix: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 20]
      }
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255]
      }
    },
    rate_per_second: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
      defaultValue: 0.0000,
      validate: {
        min: 0
      }
    },
    call_type: {
      type: DataTypes.ENUM('Internal', 'National', 'International', 'OnNet', 'OffNet'),
      allowNull: false,
      validate: {
        isIn: [['Internal', 'National', 'International', 'OnNet', 'OffNet']]
      }
    }
  }, {
    sequelize,
    modelName: 'mastertariff',
    tableName: 'master_tariffs',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['prefix']
      },
      {
        fields: ['call_type']
      }
    ]
  });

  return MasterTariff;
};
