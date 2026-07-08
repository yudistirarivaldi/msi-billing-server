'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class MasterTeam extends Model {
    static associate(models) {
      MasterTeam.belongsTo(models.masterdepartment, {
        foreignKey: 'department_id',
        as: 'department'
      });
      
      MasterTeam.hasMany(models.masterusersextension, {
        foreignKey: 'team_id',
        as: 'users'
      });
    }
  }
  
  MasterTeam.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    team_code: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    department_id: {
      type: DataTypes.UUID,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'masterteam',
    tableName: 'master_teams',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  
  return MasterTeam;
};
