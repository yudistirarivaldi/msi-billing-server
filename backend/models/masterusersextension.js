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
    team_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    monthly_quota: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    is_restricted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
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
        fields: ['team_id']
      }
    ]
  });

  MasterUsersExtension.associate = function(models) {
    MasterUsersExtension.hasMany(models.callsprocessed, {
      foreignKey: 'user_id',
      as: 'calls'
    });
    MasterUsersExtension.belongsTo(models.masterteam, {
      foreignKey: 'team_id',
      as: 'team'
    });
  };
  return MasterUsersExtension;
};
