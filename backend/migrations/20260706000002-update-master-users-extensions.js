'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Tambah kolom kode_pp_id
    await queryInterface.addColumn('master_users_extensions', 'kode_pp_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'master_kode_pps',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Tambah kolom monthly_quota
    await queryInterface.addColumn('master_users_extensions', 'monthly_quota', {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    });

    // Hapus kolom lama yang sudah digantikan oleh hirarki
    await queryInterface.removeColumn('master_users_extensions', 'department');
    await queryInterface.removeColumn('master_users_extensions', 'cost_center');
  },

  down: async (queryInterface, Sequelize) => {
    // Kembalikan kolom lama
    await queryInterface.addColumn('master_users_extensions', 'department', {
      type: Sequelize.STRING(255),
      allowNull: true
    });
    
    await queryInterface.addColumn('master_users_extensions', 'cost_center', {
      type: Sequelize.STRING(100),
      allowNull: true
    });

    // Hapus kolom baru
    await queryInterface.removeColumn('master_users_extensions', 'kode_pp_id');
    await queryInterface.removeColumn('master_users_extensions', 'monthly_quota');
  }
};
