const { callsprocessed: CallsProcessed, masterusersextension: MasterUsersExtension } = require('./models');
const { Op } = require('sequelize');

async function syncUserIds() {
  console.log('--- MEMULAI SINKRONISASI USER_ID ---');
  try {
    // 1. Ambil semua data master extension
    const users = await MasterUsersExtension.findAll();
    console.log(`Ditemukan ${users.length} user di master data.`);

    let totalUpdated = 0;

    for (const user of users) {
      // Kita update calls_processed yang extension-nya cocok dengan user ini
      // Kita handle dua kemungkinan: '47' atau '047'
      const possibleExtensions = [user.extension];
      if (user.extension.startsWith('0')) {
        possibleExtensions.push(user.extension.substring(1)); // misal '047' -> '47'
      } else if (user.extension.length === 2) {
        possibleExtensions.push('0' + user.extension); // misal '47' -> '047'
      }

      const [updatedCount] = await CallsProcessed.update(
        { user_id: user.id },
        { 
          where: { 
            caller_extension: { [Op.in]: possibleExtensions },
            user_id: null // Hanya update yang masih kosong
          } 
        }
      );
      
      if (updatedCount > 0) {
        console.log(`Berhasil menghubungkan ${updatedCount} calls ke User: ${user.name} (Ext: ${user.extension})`);
        totalUpdated += updatedCount;
      }
    }

    console.log('------------------------------------');
    console.log(`SELESAI! Total ${totalUpdated} records call berhasil dihubungkan.`);
    process.exit(0);
  } catch (error) {
    console.error('Gagal melakukan sinkronisasi:', error);
    process.exit(1);
  }
}

syncUserIds();
