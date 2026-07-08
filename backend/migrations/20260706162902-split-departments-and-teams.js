'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Remove the old foreign key constraint from master_users_extensions
    await queryInterface.removeColumn('master_users_extensions', 'kode_pp_id');

    // 2. Drop the old master_kode_pps table
    await queryInterface.dropTable('master_kode_pps');

    // 3. Create master_departments table
    await queryInterface.createTable('master_departments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      department_code: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      monthly_quota: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // 4. Create master_teams table
    await queryInterface.createTable('master_teams', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      team_code: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      department_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'master_departments',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      monthly_quota: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // 5. Add department_id and team_id to master_users_extensions
    await queryInterface.addColumn('master_users_extensions', 'department_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'master_departments',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addColumn('master_users_extensions', 'team_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'master_teams',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // In a real app we'd define the down migration, but since this is a destructive split we'll keep it simple
    await queryInterface.removeColumn('master_users_extensions', 'team_id');
    await queryInterface.removeColumn('master_users_extensions', 'department_id');
    await queryInterface.dropTable('master_teams');
    await queryInterface.dropTable('master_departments');
    // Note: Recreating master_kode_pps would go here if needed.
  }
};
