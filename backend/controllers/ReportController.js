const { callsprocessed: CallsProcessed, masterusersextension: MasterUsersExtension, cdrraw: CdrRaw, masterdepartment: MasterDepartment, masterteam: MasterTeam } = require('../models');
const { Op, fn, col, json } = require('sequelize');

// Helper function diletakkan di luar class agar aman dari masalah 'this'
const getCucmCauseDescription = (code) => {
    const causes = {
        '0': 'Normal / No Error',
        '1': 'Unallocated Number',
        '16': 'Normal Call Clearing',
        '17': 'User Busy',
        '18': 'No User Responding',
        '19': 'No Answer from User',
        '21': 'Call Rejected',
        '27': 'Destination Out of Order',
        '28': 'Invalid Number Format',
        '31': 'Normal Unspecified',
        '34': 'No Circuit / Channel Available',
        '38': 'Network Out of Order',
        '41': 'Temporary Failure',
        '47': 'Resource Unavailable',
        '111': 'Protocol Error'
    };
    return causes[code] || `Error Code ${code}`;
};

const convertCiscoTimestamp = (epoch) => {
    const parsedEpoch = parseInt(epoch);

    if (isNaN(parsedEpoch) || parsedEpoch === 0) {
        return null;
    }
    const adjustedEpoch = parsedEpoch - (7 * 3600);

    return new Date(adjustedEpoch * 1000);
};

class ReportController {
    // Invoice per User
    getInvoicePerUser = async (req, res) => {
        try {
            const { startMonth, startYear, endMonth, endYear, month, year } = req.query;
            const sMonth = startMonth || month || (new Date().getMonth() + 1);
            const sYear = startYear || year || new Date().getFullYear();
            const eMonth = endMonth || month || sMonth;
            const eYear = endYear || year || sYear;

            const startDate = new Date(sYear, sMonth - 1, 1, 0, 0, 0);
            const endDate = new Date(eYear, eMonth, 0, 23, 59, 59);

            const report = await CallsProcessed.findAll({
                attributes: [
                    'user_id',
                    [fn('SUM', col('duration')), 'total_duration'],
                    [fn('SUM', col('cost')), 'total_cost'],
                    [fn('COUNT', col('callsprocessed.id')), 'total_calls']
                ],
                include: [{
                    model: MasterUsersExtension,
                    as: 'user',
                    attributes: ['name', 'extension'], include: [{ model: MasterTeam, as: 'team', attributes: ['name'], include: [{ model: MasterDepartment, as: 'department', attributes: ['name'] }] }]
                }],
                where: {
                    normalized_time: { [Op.between]: [startDate, endDate] },
                    user_id: { [Op.ne]: null }
                },
                group: ['user_id', 'user.id', 'user->team.id', 'user->team->department.id'],
                order: [[fn('SUM', col('cost')), 'DESC']]
            });

            res.json({ success: true, period: { startDate, endDate }, data: report });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Invoice per Department
    getInvoicePerDepartment = async (req, res) => {
        try {
            const { startMonth, startYear, endMonth, endYear, month, year } = req.query;
            const sMonth = startMonth || month || (new Date().getMonth() + 1);
            const sYear = startYear || year || new Date().getFullYear();
            const eMonth = endMonth || month || sMonth;
            const eYear = endYear || year || sYear;

            const startDate = new Date(sYear, sMonth - 1, 1, 0, 0, 0);
            const endDate = new Date(eYear, eMonth, 0, 23, 59, 59);

            const report = await CallsProcessed.findAll({
                attributes: [
                    [col('user->team->department.name'), 'department'],
                    [fn('SUM', col('duration')), 'total_duration'],
                    [fn('SUM', col('cost')), 'total_cost'],
                    [fn('COUNT', col('callsprocessed.id')), 'total_calls']
                ],
                include: [{
                    model: MasterUsersExtension,
                    as: 'user',
                    attributes: [],
                    include: [{ model: MasterTeam, as: 'team', attributes: [], include: [{ model: MasterDepartment, as: 'department', attributes: [] }] }]
                }],
                where: {
                    normalized_time: { [Op.between]: [startDate, endDate] }
                },
                group: [col('user->team->department.name')],
                order: [[fn('SUM', col('cost')), 'DESC']]
            });

            res.json({ success: true, period: { startDate, endDate }, data: report });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Invoice per Cost Center
    getInvoicePerCostCenter = async (req, res) => {
        try {
            const { startMonth, startYear, endMonth, endYear, month, year } = req.query;
            const sMonth = startMonth || month || (new Date().getMonth() + 1);
            const sYear = startYear || year || new Date().getFullYear();
            const eMonth = endMonth || month || sMonth;
            const eYear = endYear || year || sYear;

            const startDate = new Date(sYear, sMonth - 1, 1, 0, 0, 0);
            const endDate = new Date(eYear, eMonth, 0, 23, 59, 59);

            const report = await CallsProcessed.findAll({
                attributes: [
                    [col('user.cost_center'), 'cost_center'],
                    [fn('SUM', col('duration')), 'total_duration'],
                    [fn('SUM', col('cost')), 'total_cost'],
                    [fn('COUNT', col('callsprocessed.id')), 'total_calls']
                ],
                include: [{
                    model: MasterUsersExtension,
                    as: 'user',
                    attributes: []
                }],
                where: {
                    normalized_time: { [Op.between]: [startDate, endDate] }
                },
                group: [col('user.cost_center')],
                order: [[fn('SUM', col('cost')), 'DESC']]
            });

            res.json({ success: true, period: { startDate, endDate }, data: report });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Top 10 Callers (By Duration)
    getTopCallers = async (req, res) => {
        try {
            const { startMonth, startYear, endMonth, endYear, month, year, limit = 10 } = req.query;
            const sMonth = startMonth || month || (new Date().getMonth() + 1);
            const sYear = startYear || year || new Date().getFullYear();
            const eMonth = endMonth || month || sMonth;
            const eYear = endYear || year || sYear;

            const startDate = new Date(sYear, sMonth - 1, 1, 0, 0, 0);
            const endDate = new Date(eYear, eMonth, 0, 23, 59, 59);

            const report = await CallsProcessed.findAll({
                attributes: [
                    'user_id',
                    [fn('SUM', col('duration')), 'total_duration'],
                    [fn('SUM', col('cost')), 'total_cost'],
                    [fn('COUNT', col('callsprocessed.id')), 'total_calls']
                ],
                include: [{
                    model: MasterUsersExtension,
                    as: 'user',
                    attributes: ['name', 'extension'], include: [{ model: MasterTeam, as: 'team', attributes: ['name'], include: [{ model: MasterDepartment, as: 'department', attributes: ['name'] }] }]
                }],
                where: {
                    normalized_time: { [Op.between]: [startDate, endDate] },
                    user_id: { [Op.ne]: null }
                },
                group: ['user_id', 'user.id', 'user->team.id', 'user->team->department.id'],
                order: [[fn('SUM', col('cost')), 'DESC']],
                limit: parseInt(limit)
            });

            res.json({ success: true, period: { startDate, endDate }, data: report });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    getUserCalls = async (req, res) => {
        try {
            // Mengambil userId dari URL parameter
            const { userId } = req.params;
            // Mengambil opsi filter bulan dan tahun tunggal maupun range tanggal dari query string
            const { month, year, startMonth, startYear, endMonth, endYear } = req.query;

            let startDate, endDate;

            // Menguji jika klien mengirimkan filter rentang tanggal (range) lengkap
            if (startMonth && startYear && endMonth && endYear) {
                // Membuat tanggal mulai (start) dari awal bulan terpilih pukul 00:00:00
                startDate = new Date(parseInt(startYear), parseInt(startMonth) - 1, 1, 0, 0, 0);
                // Membuat tanggal akhir (end) sampai akhir bulan terpilih pukul 23:59:59 secara presisi
                endDate = new Date(parseInt(endYear), parseInt(endMonth), 0, 23, 59, 59);
            } else {
                // Fallback ke filter bulan tunggal atau menggunakan bulan/tahun saat ini
                const sMonth = month || (new Date().getMonth() + 1);
                const sYear = year || new Date().getFullYear();

                // Membuat range tanggal satu bulan penuh
                startDate = new Date(parseInt(sYear), parseInt(sMonth) - 1, 1, 0, 0, 0);
                endDate = new Date(parseInt(sYear), parseInt(sMonth), 0, 23, 59, 59);
            }

            // Menarik semua data master user extension untuk mencocokkan nama nomor tujuan (destination_number)
            const allUsers = await MasterUsersExtension.findAll({
                attributes: ['extension', 'name']
            });
            const extToNameMap = {};
            allUsers.forEach(u => {
                extToNameMap[u.extension] = u.name;
            });

            // Melakukan query untuk mengambil semua riwayat panggilan yang dilakukan oleh user tersebut dalam rentang tanggal
            const calls = await CallsProcessed.findAll({
                where: {
                    user_id: userId,
                    normalized_time: { [Op.between]: [startDate, endDate] }
                },
                // Diurutkan berdasarkan waktu panggil terbaru agar memudahkan visualisasi kronologis
                order: [['normalized_time', 'DESC']],
                include: [
                    // Menyatukan model MasterUsersExtension untuk info profil user
                    {
                        model: MasterUsersExtension,
                        as: 'user',
                        attributes: ['name', 'extension'], include: [{ model: MasterTeam, as: 'team', attributes: ['name'], include: [{ model: MasterDepartment, as: 'department', attributes: ['name'] }] }]
                    },
                    // Menyatukan model CdrRaw untuk mendapatkan origination dan disconnect timestamp asli dari Cisco CUCM
                    {
                        model: CdrRaw,
                        as: 'cdr_raw',
                        attributes: ['dateTimeOrigination', 'dateTimeConnect', 'dateTimeDisconnect']
                    }
                ]
            });

            // Melakukan mapping data mentah ke format siap pakai untuk UI
            const formattedCalls = calls.map(call => {
                // Konversi objek sequelize menjadi JSON mentah
                const data = call.toJSON();
                // Mengambil referensi CDR raw jika tersedia
                const cdr = data.cdr_raw || {};

                // Konversi cisco epoch timestamp (detik) ke objek Date JS
                const dialTime = convertCiscoTimestamp(cdr.dateTimeOrigination);
                const connectTime = convertCiscoTimestamp(cdr.dateTimeConnect);
                const disconnectTime = convertCiscoTimestamp(cdr.dateTimeDisconnect);

                // Hitung durasi berdering sebelum tersambung atau terputus
                let ringingDuration = 0;
                // Jika panggilan berhasil terhubung, selisih waktu connect dan dial adalah durasi ringing
                if (dialTime && connectTime) {
                    ringingDuration = Math.max(0, Math.round((connectTime - dialTime) / 1000));
                } else if (dialTime && disconnectTime) {
                    // Jika panggilan tidak terjawab/gagal, ringing dihitung dari dial hingga terputus
                    ringingDuration = Math.max(0, Math.round((disconnectTime - dialTime) / 1000));
                }

                // Mendapatkan nama dari extension tujuan panggilan jika ada di database
                const destName = extToNameMap[data.destination_number] || null;

                // Menyusun kembali payload response yang akan dikirim ke client
                return {
                    ...data,
                    destination_name: destName,
                    timeline: {
                        dial_time: dialTime ? dialTime.toISOString() : null,
                        connect_time: connectTime ? connectTime.toISOString() : null,
                        disconnect_time: disconnectTime ? disconnectTime.toISOString() : null,
                        ringing_duration_seconds: ringingDuration
                    }
                };
            });

            // Mengirim data berformat JSON kembali ke client dengan status HTTP 200 OK
            res.json({ success: true, data: formattedCalls });
        } catch (error) {
            // Menangkap error jika query database gagal
            res.status(500).json({ success: false, message: error.message });
        }
    }


    // Utilization Trend (Daily)
    getUtilization = async (req, res) => {
        try {
            const { startMonth, startYear, endMonth, endYear, month, year } = req.query;
            const sMonth = startMonth || month || (new Date().getMonth() + 1);
            const sYear = startYear || year || new Date().getFullYear();
            const eMonth = endMonth || month || sMonth;
            const eYear = endYear || year || sYear;

            const startDate = new Date(sYear, sMonth - 1, 1, 0, 0, 0);
            const endDate = new Date(eYear, eMonth, 0, 23, 59, 59);

            const report = await CallsProcessed.findAll({
                attributes: [
                    [fn('DATE', col('normalized_time')), 'date'],
                    [fn('COUNT', col('callsprocessed.id')), 'total_calls'],
                    [fn('SUM', col('duration')), 'total_duration']
                ],
                where: {
                    normalized_time: { [Op.between]: [startDate, endDate] }
                },
                group: [fn('DATE', col('normalized_time'))],
                order: [[fn('DATE', col('normalized_time')), 'ASC']]
            });

            res.json({ success: true, period: { startDate, endDate }, data: report });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Summary / Cost Allocation (By Call Type)
    getSummary = async (req, res) => {
        try {
            const { startMonth, startYear, endMonth, endYear, month, year } = req.query;
            const sMonth = startMonth || month || (new Date().getMonth() + 1);
            const sYear = startYear || year || new Date().getFullYear();
            const eMonth = endMonth || month || sMonth;
            const eYear = endYear || year || sYear;

            const startDate = new Date(sYear, sMonth - 1, 1, 0, 0, 0);
            const endDate = new Date(eYear, eMonth, 0, 23, 59, 59);

            const report = await CallsProcessed.findAll({
                attributes: [
                    'call_type',
                    [fn('COUNT', col('callsprocessed.id')), 'total_calls'],
                    [fn('SUM', col('duration')), 'total_duration'],
                    [fn('SUM', col('cost')), 'total_cost']
                ],
                where: {
                    normalized_time: { [Op.between]: [startDate, endDate] }
                },
                group: ['call_type'],
                order: [[fn('SUM', col('cost')), 'DESC']]
            });

            res.json({ success: true, period: { startDate, endDate }, data: report });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Recent Calls
    getRecentCalls = async (req, res) => {
        try {
            // Ambil 20 panggilan teratas diurutkan berdasarkan waktu tersambung secara descending
            const calls = await CallsProcessed.findAll({
                limit: 20,
                order: [['normalized_time', 'DESC']],
                include: [
                    // Gabungkan dengan data Master User berdasarkan Extension
                    {
                        model: MasterUsersExtension,
                        as: 'user',
                        attributes: ['name', 'extension']
                    },
                    // Gabungkan dengan data CdrRaw mentah untuk mendapatkan timestamp presisi
                    {
                        model: CdrRaw,
                        as: 'cdr_raw',
                        attributes: ['dateTimeOrigination', 'dateTimeConnect', 'dateTimeDisconnect']
                    }
                ]
            });

            // Format data panggilan untuk menyertakan timeline yang siap dikonsumsi oleh frontend
            const formattedCalls = calls.map(call => {
                const data = call.toJSON();
                const cdr = data.cdr_raw || {};

                // Konversi timestamp epoch detik dari Cisco ke objek Date/ISO String
                const dialTime = convertCiscoTimestamp(cdr.dateTimeOrigination);
                const connectTime = convertCiscoTimestamp(cdr.dateTimeConnect);
                const disconnectTime = convertCiscoTimestamp(cdr.dateTimeDisconnect);

                // Hitung durasi dering (ringing duration) dalam detik sebelum telepon diangkat
                let ringingDuration = 0;
                if (dialTime && connectTime) {
                    ringingDuration = Math.max(0, Math.round((connectTime - dialTime) / 1000));
                } else if (dialTime && disconnectTime) {
                    // Jika panggilan tidak terjawab, dering dihitung sampai panggilan terputus
                    ringingDuration = Math.max(0, Math.round((disconnectTime - dialTime) / 1000));
                }

                // Tambahkan field timeline ke objek response
                return {
                    ...data,
                    timeline: {
                        dial_time: dialTime ? dialTime.toISOString() : null,
                        connect_time: connectTime ? connectTime.toISOString() : null,
                        disconnect_time: disconnectTime ? disconnectTime.toISOString() : null,
                        ringing_duration_seconds: ringingDuration
                    }
                };
            });

            // Kembalikan data sukses ke frontend
            res.json({ success: true, data: formattedCalls });
        } catch (error) {
            // Log error jika ada kegagalan query database
            console.error('Error in getRecentCalls:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Dashboard Stats (KPI)
    getDashboardStats = async (req, res) => {
        try {
            const now = new Date();
            // Start of today in WIB (UTC+7)
            let targetDate = new Date(now.getTime());
            targetDate.setUTCHours(0 - 7, 0, 0, 0);

            let totalToday = await CallsProcessed.count({
                where: { normalized_time: { [Op.gte]: targetDate } }
            });

            let isFallback = false;
            // Jika hari ini kosong, ambil data terakhir agar dashboard ada isinya
            if (totalToday === 0) {
                const latestCall = await CallsProcessed.findOne({ order: [['normalized_time', 'DESC']] });
                if (latestCall) {
                    targetDate = new Date(latestCall.normalized_time);
                    targetDate.setHours(0, 0, 0, 0);
                    totalToday = await CallsProcessed.count({
                        where: { normalized_time: { [Op.gte]: targetDate } }
                    });
                    isFallback = true;
                }
            }

            const abnormalToday = await CallsProcessed.count({
                where: {
                    normalized_time: { [Op.gte]: targetDate },
                    [Op.or]: [{ duration: { [Op.lte]: 10 } }, { status: 'Abnormal' }]
                }
            });

            const statsSum = await CallsProcessed.findOne({
                attributes: [[fn('SUM', col('cost')), 'total_cost']],
                where: { normalized_time: { [Op.gte]: targetDate } },
                raw: true
            });

            res.json({
                success: true,
                data: {
                    total_today: totalToday,
                    total_cost: parseFloat(statsSum?.total_cost || 0),
                    success_rate: totalToday > 0 ? Math.round(((totalToday - abnormalToday) / totalToday) * 100) : 0,
                    abnormal_today: abnormalToday,
                    active_date: targetDate,
                    is_live_today: !isFallback // Biar tau ini data hari ini atau data terakhir
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Alert Abnormal Calls (Detailed List)
    getAbnormalCalls = async (req, res) => {
        try {
            // Dapatkan limit jumlah baris dari parameter query, default 10 baris
            const { limit = 10 } = req.query;

            // Query data calls_processed yang durasinya <= 10 detik atau memiliki status abnormal
            const calls = await CallsProcessed.findAll({
                limit: parseInt(limit),
                order: [['normalized_time', 'DESC']],
                where: {
                    [Op.or]: [
                        { duration: { [Op.lte]: 10 } },
                        { status: 'Abnormal' }
                    ]
                },
                include: [
                    // Gabungkan dengan data Master User berdasarkan Extension
                    {
                        model: MasterUsersExtension,
                        as: 'user',
                        attributes: ['name', 'extension']
                    },
                    // Gabungkan dengan data CdrRaw mentah untuk mendapatkan kode pemutusan panggilan & timeline
                    {
                        model: CdrRaw,
                        as: 'cdr_raw',
                        attributes: [
                            'dateTimeOrigination',
                            'dateTimeConnect',
                            'dateTimeDisconnect',
                            'origCause_value',
                            'destCause_value'
                        ]
                    }
                ]
            });

            // Menarik semua data master user extension untuk mencocokkan nama nomor tujuan (destination_number)
            const allUsers = await MasterUsersExtension.findAll({
                attributes: ['extension', 'name']
            });
            const extToNameMap = {};
            allUsers.forEach(u => {
                extToNameMap[u.extension] = u.name;
            });

            // Map data untuk menyematkan deskripsi error & timeline panggilan
            const result = calls.map(call => {
                const data = call.toJSON();
                const cdr = data.cdr_raw || {};

                // Ambil kode pemutusan panggilan (Cause Code) dari pemanggil atau penerima
                const cause = cdr.destCause_value || cdr.origCause_value || 0;

                // Konversi timestamp epoch detik dari Cisco ke objek Date/ISO String
                const dialTime = convertCiscoTimestamp(cdr.dateTimeOrigination);
                const connectTime = convertCiscoTimestamp(cdr.dateTimeConnect);
                const disconnectTime = convertCiscoTimestamp(cdr.dateTimeDisconnect);

                // Hitung durasi dering (ringing duration) dalam detik sebelum panggilan berakhir/terputus
                let ringingDuration = 0;
                if (dialTime && connectTime) {
                    ringingDuration = Math.max(0, Math.round((connectTime - dialTime) / 1000));
                } else if (dialTime && disconnectTime) {
                    ringingDuration = Math.max(0, Math.round((disconnectTime - dialTime) / 1000));
                }

                // Mendapatkan nama dari extension tujuan panggilan jika ada di database
                const destName = extToNameMap[data.destination_number] || null;

                // Kembalikan objek data yang lengkap dengan detail timeline & deskripsi error
                return {
                    ...data,
                    destination_name: destName,
                    error_description: getCucmCauseDescription(cause),
                    timeline: {
                        dial_time: dialTime ? dialTime.toISOString() : null,
                        connect_time: connectTime ? connectTime.toISOString() : null,
                        disconnect_time: disconnectTime ? disconnectTime.toISOString() : null,
                        ringing_duration_seconds: ringingDuration
                    }
                };
            });

            // Kirim respon sukses ke frontend
            res.json({ success: true, data: result });
        } catch (error) {
            // Log error secara detail di server backend
            console.error('Error in getAbnormalCalls:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    getLongCalls = async (req, res) => {
        try {
            // Dapatkan limit jumlah baris dari parameter query, default 10 baris
            const { limit = 10 } = req.query;

            // Query data calls_processed yang durasinya lebih dari 5 menit (300 detik)
            const calls = await CallsProcessed.findAll({
                limit: parseInt(limit),
                order: [['normalized_time', 'DESC']],
                where: {
                    duration: {
                        [Op.gt]: 300 // durasi panggil lebih dari 300 detik (5 menit)
                    }
                },
                include: [
                    // Gabungkan dengan data Master User berdasarkan Extension
                    {
                        model: MasterUsersExtension,
                        as: 'user',
                        attributes: ['name', 'extension'], include: [{ model: MasterTeam, as: 'team', attributes: ['name'], include: [{ model: MasterDepartment, as: 'department', attributes: ['name'] }] }]
                    },
                    // Gabungkan dengan data CdrRaw mentah untuk mendapatkan data timeline
                    {
                        model: CdrRaw,
                        as: 'cdr_raw',
                        attributes: [
                            'dateTimeOrigination',
                            'dateTimeConnect',
                            'dateTimeDisconnect',
                            'origCause_value',
                            'destCause_value'
                        ]
                    }
                ]
            });

            // Menarik semua data master user extension untuk mencocokkan nama nomor tujuan (destination_number)
            const allUsers = await MasterUsersExtension.findAll({
                attributes: ['extension', 'name']
            });
            const extToNameMap = {};
            allUsers.forEach(u => {
                extToNameMap[u.extension] = u.name;
            });

            // Map data untuk menyematkan deskripsi & timeline panggilan
            const result = calls.map(call => {
                const data = call.toJSON();
                const cdr = data.cdr_raw || {};

                // Konversi timestamp epoch detik dari Cisco ke objek Date/ISO String
                const dialTime = convertCiscoTimestamp(cdr.dateTimeOrigination);
                const connectTime = convertCiscoTimestamp(cdr.dateTimeConnect);
                const disconnectTime = convertCiscoTimestamp(cdr.dateTimeDisconnect);

                // Hitung durasi dering (ringing duration) dalam detik
                let ringingDuration = 0;
                if (dialTime && connectTime) {
                    ringingDuration = Math.max(0, Math.round((connectTime - dialTime) / 1000));
                } else if (dialTime && disconnectTime) {
                    ringingDuration = Math.max(0, Math.round((disconnectTime - dialTime) / 1000));
                }

                // Format durasi dalam menit dan detik agar mudah dibaca di UI
                const minutes = Math.floor(data.duration / 60);
                const seconds = data.duration % 60;
                const durationFormatted = `${minutes}m ${seconds}s`;

                // Mendapatkan nama dari extension tujuan panggilan jika ada di database
                const destName = extToNameMap[data.destination_number] || null;

                // Kembalikan objek data yang lengkap dengan detail timeline & deskripsi durasi
                return {
                    ...data,
                    destination_name: destName,
                    duration_formatted: durationFormatted,
                    timeline: {
                        dial_time: dialTime ? dialTime.toISOString() : null,
                        connect_time: connectTime ? connectTime.toISOString() : null,
                        disconnect_time: disconnectTime ? disconnectTime.toISOString() : null,
                        ringing_duration_seconds: ringingDuration
                    }
                };
            });

            // Kirim respon sukses ke frontend
            res.json({ success: true, data: result });
        } catch (error) {
            // Log error secara detail di server backend
            console.error('Error in getLongCalls:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new ReportController();
