'use strict';

const db = require('./models');
const { Op } = require('sequelize');
const cucmService = require('./services/cucmService');

class BillingService {

  static determineCallType(called, calledPartition = '') {
    let calledNum = String(called || '').trim();
    const dPart = String(calledPartition || '').toLowerCase();

    // 1. Cek bypass awal berdasarkan nama partition yang fix milik internal ekstensi
    // Di file BCA kemarin menggunakan suffix '_ext_pt' (seperti wa_ext_pt, mb_ext_pt)
    if (dPart.includes('_ext_pt') || dPart.includes('cisco_avaya')) {
      return 'Internal';
    }

    // 2. Jika nomor diawali dengan prefix keluar '9'
    let isExternalByPrefix = false;
    if (calledNum.startsWith('9') && calledNum.length > 5) {
      calledNum = calledNum.substring(1); // Buang angka 9 di depan, ambil sisanya
      isExternalByPrefix = true;
    }

    // 3. Setelah dibersihkan dari angka 9, cek format International
    if (calledNum.startsWith('00') || calledNum.startsWith('+')) {
      return 'International';
    }

    // 4. Setelah dibersihkan dari angka 9, cek format National (Mobile atau Interlocal)
    if (calledNum.startsWith('0')) {
      return 'National';
    }

    // 5. Jika panjang asli <= 5 digit dan tidak ada tanda-tanda prefix luar, berarti internal extension standar
    if (!isExternalByPrefix && calledNum.length <= 5) {
      return 'Internal';
    }

    // 6. OnNet/OffNet: Dideteksi dari Gateway/Partition tambahan
    if (dPart.includes('onnet') || dPart.includes('trunk')) return 'OnNet';
    if (dPart.includes('offnet') || dPart.includes('gateway')) return 'OffNet';

    // 7. Jika diawali angka 9 tapi setelahnya bukan 0 (misal: 96761149), itu telepon rumah/kantor sesama kota
    if (isExternalByPrefix) {
      return 'National'; // Kategori National (Local PSTN)
    }

    return 'Internal'; // Default jika benar-benar tidak cocok dengan rule luar manapun
  }

  // Mapping User / Extension / Department
  static async mapUser(extension, loginUserID, deviceName) {
    try {
      // Prioritas 1: Berdasarkan Extension
      let user = await db.masterusersextension.findOne({
        where: { extension: extension }
      });

      if (user) return user;

      // Prioritas 2: Berdasarkan Device Name
      if (deviceName) {
        user = await db.masterusersextension.findOne({
          where: { device_name: deviceName }
        });
        if (user) return user;
      }

      // Prioritas 3: Berdasarkan UserID (UnicodeLoginUserID)
      // Note: Jika di master_users_extensions nanti ada field user_id_cucm

      return null;
    } catch (error) {
      console.error('Error mapping user:', error);
      return null;
    }
  }

  // Apply Rating / Tarif (Prefix Matching)
  static async calculateCost(destinationNumber, duration, callType) {
    try {
      if (callType === 'Internal' || duration <= 0) return 0;

      // Nomor tujuan tidak perlu dibuang prefix 9-nya karena di master_tariff prefix-nya sudah terdaftar dengan angka 9 (misal: 908, 900)
      let cleanedNumber = destinationNumber;

      const prefixes = this.generatePrefixes(cleanedNumber);

      // Cari prefix terpanjang yang cocok (Best Match)
      const tariffs = await db.mastertariff.findAll({
        where: {
          call_type: callType,
          prefix: { [Op.in]: prefixes }
        },
        order: [[db.sequelize.fn('length', db.sequelize.col('prefix')), 'DESC']],
        limit: 1
      });

      if (tariffs.length > 0) {
        const rate = tariffs[0].rate_per_second;
        return parseFloat((duration * rate).toFixed(4));
      }

      return 0;
    } catch (error) {
      console.error('Error calculating cost:', error);
      return 0;
    }
  }

  // Helper untuk generate prefix dari nomor (misal: 0812 -> [0, 08, 081, 0812])
  static generatePrefixes(number) {
    const prefixes = [];
    for (let i = 1; i <= number.length; i++) {
      prefixes.push(number.substring(0, i));
    }
    return prefixes;
  }

  // Orchestrator: Proses satu record CDR
  static async processRecord(cdrRawId, rowData) {
    const duration = parseInt(rowData.duration || 0);

    // Step 1: Call Type
    // Memanggil determineCallType untuk mengklasifikasikan kategori panggilan (Internal, National, International, dll.)
    // dengan menggunakan nomor tujuan (finalCalledPartyNumber) dan partisinya (finalCalledPartyNumberPartition)
    // sebagai input utama sesuai perubahan signature method terbaru.
    const callType = this.determineCallType(
      rowData.finalCalledPartyNumber,
      rowData.finalCalledPartyNumberPartition
    );

    // Step 2: Mapping User
    const user = await this.mapUser(
      rowData.callingPartyNumber,
      rowData.callingPartyUnicodeLoginUserID,
      rowData.origDeviceName
    );

    // Step 3: Calculate Cost
    const cost = await this.calculateCost(
      rowData.finalCalledPartyNumber,
      duration,
      callType
    );

    // Step 4: Determine Status
    let status = 'Normal';
    const origCause = parseInt(rowData.origCause_value);
    const destCause = parseInt(rowData.destCause_value);

    // 16 = Normal call clearing, 0 = No error (in some contexts)
    // Jika durasi <= 10 dan bukan normal clearing, anggap abnormal
    if (duration <= 10 && (origCause !== 16 && origCause !== 0 && destCause !== 16 && destCause !== 0)) {
      status = 'Abnormal';
    }

    // CUCM timestamps are in seconds
    const connectTime = parseInt(rowData.dateTimeConnect);
    
    // Koreksi timezone: Kurangi 7 jam (7 * 3600 detik) dari epoch.
    // Hal ini dikarenakan server Cisco CUCM mencatat waktu lokal Jakarta (WIB, UTC+7) 
    // langsung sebagai nilai UTC mentah (offset +7 jam di hardware/system clock).
    // Dengan mengurangi 7 jam, kita mendapatkan epoch UTC sesungguhnya, sehingga ketika
    // browser mengonversinya kembali ke WIB (+7), nilainya akan kembali ke waktu asli pemanggilan.
    const adjustedConnectTime = connectTime > 0 ? connectTime - (7 * 3600) : 0;
    const normalizedTime = adjustedConnectTime > 0 ? new Date(adjustedConnectTime * 1000) : new Date();

    return {
      call_id: cdrRawId,
      normalized_time: normalizedTime,
      duration: duration,
      caller_extension: rowData.callingPartyNumber || '',
      destination_number: rowData.finalCalledPartyNumber || '',
      call_type: callType,
      user_id: user ? user.id : null,
      cost: cost,
      cmc_fac_code: rowData.clientMatterCode || rowData.authCodeDescription || null,
      status: status
    };
  }

  // Evaluasi Kuota Semua Pengguna
  static async evaluateUserQuotas() {
    console.log('[QUOTA] Starting user quota evaluation...');
    try {
      // Dapatkan awal dan akhir bulan berjalan
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      // Cari semua user (join dengan CallProcessed untuk bulan ini)
      const users = await db.masterusersextension.findAll({
        attributes: [
          'id', 'extension', 'name', 'monthly_quota', 'is_restricted', 'device_name',
          [db.sequelize.fn('SUM', db.sequelize.col('calls.cost')), 'total_cost']
        ],
        include: [{
          model: db.callsprocessed,
          as: 'calls',
          attributes: [],
          where: {
            normalized_time: {
              [Op.between]: [firstDay, lastDay]
            }
          },
          required: false
        }],
        group: ['masterusersextension.id']
      });

      let restrictedCount = 0;
      for (const user of users) {
        // Jika monthly_quota == 0, anggap unlimited / tidak dipantau
        if (!user.monthly_quota || parseFloat(user.monthly_quota) <= 0) continue;

        const totalCost = parseFloat(user.dataValues.total_cost) || 0;
        const quota = parseFloat(user.monthly_quota);

        if (totalCost >= quota && !user.is_restricted) {
          console.log(`[QUOTA] User ${user.name} (${user.extension}) exceeded quota: Rp ${totalCost} >= Rp ${quota}`);
          
          // Trigger CUCM Restriction
          if (user.device_name) {
            const success = await cucmService.restrictDevice(user.device_name);
            if (success) {
              await user.update({ is_restricted: true });
              restrictedCount++;
            } else {
              console.warn(`[QUOTA] Failed to restrict user ${user.name} in CUCM. Marking restricted in DB anyway for testing.`);
              // Paksa update ke true di database meskipun CUCM gagal karena environment lokal
              await user.update({ is_restricted: true }); 
            }
          } else {
            console.warn(`[QUOTA] Cannot restrict user ${user.name} in CUCM (No device_name mapped).`);
            // Opsional: kita bisa menandai is_restricted = true juga di database meskipun gagal di CUCM
            // await user.update({ is_restricted: true }); 
          }
        }
      }

      console.log(`[QUOTA] Evaluation completed. Restricted ${restrictedCount} users.`);
    } catch (error) {
      console.error('[QUOTA] Error evaluating quotas:', error);
    }
  }
}

module.exports = BillingService;
