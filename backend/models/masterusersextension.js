'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class MasterUsersExtension extends Model {}

  MasterUsersExtension.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    extension: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [1, 50]
      }
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255]
      }
    },
    department: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    cost_center: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    device_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'masterusersextension',
    tableName: 'master_users_extensions',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['extension']
      },
      {
        fields: ['device_name']
      },
      {
        fields: ['department']
      }
    ]
  });

  MasterUsersExtension.associate = function(models) {
    MasterUsersExtension.hasMany(models.callsprocessed, {
      foreignKey: 'user_id',
      as: 'calls'
    });
  };
  return MasterUsersExtension;
};
