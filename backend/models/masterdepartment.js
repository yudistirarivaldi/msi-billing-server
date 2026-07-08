'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class MasterDepartment extends Model {
    static associate(models) {
      MasterDepartment.hasMany(models.masterteam, {
        foreignKey: 'department_id',
        as: 'teams'
      });
    }
  }
  
  MasterDepartment.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    department_code: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'masterdepartment',
    tableName: 'master_departments',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  
  return MasterDepartment;
};
