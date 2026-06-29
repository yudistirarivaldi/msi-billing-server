'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('master_tariffs', [
      // INTERNAL EXTENSION (7 Digit - Sesuai range di CSV seperti kepala 1, 2, 6)
      {
        prefix: '1',
        description: 'Internal Extension Range 1xxxxxx (Wisma Asia / Menara BCA)',
        rate_per_second: 0.0000,
        call_type: 'Internal',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        prefix: '2',
        description: 'Internal Extension Range 2xxxxxx (Branch/Cabang)',
        rate_per_second: 0.0000,
        call_type: 'Internal',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        prefix: '6',
        description: 'Internal Extension Range 6xxxxxx (Cisco-Avaya Integration)',
        rate_per_second: 0.0000,
        call_type: 'Internal',
        created_at: new Date(),
        updated_at: new Date()
      },
      
      // NATIONAL / MOBILE (Harus pakai prefix akses keluar '9' di depannya)
      {
        prefix: '90', // Fallback Akses Keluar 9 + Area Code Lainnya
        description: 'National General (PSTN/Toll Free) via Outbound Trunk',
        rate_per_second: 5.0000,
        call_type: 'National',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        prefix: '908', // Kombinasi Akses Keluar 9 + Prefix HP 08
        description: 'National Mobile via Outbound Trunk (Telkomsel, XL, Indosat)',
        rate_per_second: 10.0000,
        call_type: 'National',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        prefix: '9021', // Akses Keluar 9 + Kode Area Jakarta 021
        description: 'Landline Jakarta via Outbound Trunk',
        rate_per_second: 5.0000,
        call_type: 'National',
        created_at: new Date(),
        updated_at: new Date()
      },

      // INTERNATIONAL (Akses Keluar 9 + SLI 00x atau +)
      {
        prefix: '900', // Akses Keluar 9 + International Prefix 00
        description: 'International SLI via Outbound Trunk',
        rate_per_second: 100.0000,
        call_type: 'International',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        prefix: '9+', // Akses Keluar 9 + Format Global +
        description: 'International General via Outbound Trunk (+)',
        rate_per_second: 150.0000,
        call_type: 'International',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('master_tariffs', null, {});
  }
};