const cron = require('node-cron');
const db = require('./models');
const cucmService = require('./services/cucmService');

class CronService {
  start() {
    // Jalankan setiap tanggal 1, jam 00:01 WIB
    // Format: menit jam tanggal bulan hari
    cron.schedule('1 0 1 * *', async () => {
      console.log('[CRON] Starting monthly quota reset job...');
      try {
        const restrictedUsers = await db.masterusersextension.findAll({
          where: { is_restricted: true }
        });

        if (restrictedUsers.length === 0) {
          console.log('[CRON] No restricted users found for reset.');
          return;
        }

        let resetCount = 0;
        for (const user of restrictedUsers) {
          console.log(`[CRON] Resetting quota restriction for user: ${user.name} (${user.extension})`);
          
          let success = true;
          if (user.device_name) {
            success = await cucmService.unrestrictDevice(user.device_name);
            if (!success) {
              console.warn(`[CRON] Failed to unrestrict device ${user.device_name} in CUCM. Still resetting DB for month rollover.`);
            }
          }

          // Tetap update database menjadi false agar perhitungan bulan ini kembali normal
          await user.update({ is_restricted: false });
          resetCount++;
        }

        console.log(`[CRON] Monthly reset completed. Reset ${resetCount} users.`);
      } catch (error) {
        console.error('[CRON] Error during monthly quota reset:', error);
      }
    }, {
      scheduled: true,
      timezone: "Asia/Jakarta"
    });

    console.log('[INFO] CronService initialized: Scheduled monthly reset job (1st of every month at 00:01 WIB)');
  }
}

module.exports = new CronService();
