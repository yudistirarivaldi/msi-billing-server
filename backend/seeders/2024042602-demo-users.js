const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Diperbarui berdasarkan sampel data ekstensi 7 digit & nomor luar asli dari csv-bca2.csv
    const extensions = [
      '1300560', '1300564', '1065158', '1078792', '6761149', 
      '1220060', '2120095', '1020841', '6761050', '2175356', 
      '1220261', '2120403', '1220072', '1220065', '1220073', 
      '1271706', '1280183', '1220091', '1220090', '1220442', 
      '1247200', '1220084', '1220074', '1220085', '1220094', 
      '1220067', '1220086', '1620212', '1220087', '1620374', 
      '1074937', '1220066', '1679028',
      '1620065', '1020086', '5511290', '1269783', '1220062', 
      '1681298', '1220068', '1073695', '89666008880',
      '1683325', '1520085', '1520086',
      '2175796', '6402719', 
      '9081299393405', '900180361838', '90180361838', '9082353257881', '908170552991', '9081311127428'
    ];

    // Fetch Kode PPs to assign users randomly
    const kodePps = await queryInterface.sequelize.query(
      `SELECT id FROM master_teams ;`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    const names = [
      'Andi Pratama', 'Siti Aminah', 'Ahmad Sudais', 'Budi Santoso', 'Dewi Lestari', 
      'Eko Wahyudi', 'Fitriani', 'Guruh Soekarno', 'Hendra Wijaya', 'Indah Permata',
      'Joko Susilo', 'Kartika Putri', 'Lukman Hakim', 'Maya Sari', 'Nanang Kosim',
      'Oki Setiana', 'Putra Perkasa', 'Qory Sandioriva', 'Rian Hidayat', 'Siska Amelia',
      'Taufik Hidayat', 'Umar bin Khattab', 'Vina Panduwinata', 'Wawan Darmawan', 'Xena Warrior',
      'Yanto Basna', 'Zulkifli Hasan', 'Cecep Supriadi', 'Dadang Subur', 'Bambang Pamungkas',
      'Euis Dahlia', 'Fajar Alfian', 'Giri Wijaya', 'Hary Tanoe', 'Iqbal Ramadhan', 'Jefri Nichol', 
      'Kaesang Pangarep', 'Lesti Kejora', 'Maudy Ayunda', 'Nia Ramadhani', 'Olla Ramlan', 'Prilly Latuconsina',
      'Raffi Ahmad', 'Atta Halilintar', 'Baim Wong',
      'Anya Geraldine', 'Jerome Polin'
    ];

    const userData = extensions.map((ext, index) => {
      const name = names[index % names.length];
      const randomKodePpId = kodePps.length > 0 ? kodePps[Math.floor(Math.random() * kodePps.length)].id : null;
      const randomQuota = Math.floor(Math.random() * 15) * 100000 + 500000; // Random between 500k to 2M

      return {
        id: uuidv4(),
        extension: ext,
        name: name,
        team_id: randomKodePpId,
        monthly_quota: randomQuota,
        device_name: `SEP${Math.random().toString(16).slice(2, 14).toUpperCase()}`,
        created_at: new Date(),
        updated_at: new Date()
      };
    });

    // Hapus data lama dulu agar tidak duplicate saat seeding ulang
    await queryInterface.bulkDelete('master_users_extensions', null, {});
    
    return queryInterface.bulkInsert('master_users_extensions', userData, {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('master_users_extensions', null, {});
  }
};