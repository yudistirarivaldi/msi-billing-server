# CUCM Billing & Quota Management System - Workflow & Scope

Dokumen ini berfungsi sebagai sumber kebenaran utama (*Single Source of Truth*) mengenai arsitektur, alur kerja, dan batasan ruang lingkup (*scope*) dari aplikasi MSI Billing System. Tujuannya adalah untuk mencegah *feature creep* (pengembangan fitur di luar rencana) dan menjaga fokus pengerjaan.

---

## 1. Arsitektur Utama Sistem

Aplikasi ini dibagi menjadi 3 pilar utama:
1. **CDR Importer & Processor (Background Service)**: Menonton folder *incoming*, mem-parsing file CSV dari Cisco CUCM, dan menghitung tagihan.
2. **Quota Evaluator & CUCM Controller (Engine)**: Memantau pengeluaran pengguna secara *real-time* dan melakukan aksi penguncian telepon (*Restriction*) secara langsung ke server Cisco jika kuota habis.
3. **Web Dashboard & API (Frontend + Backend)**: Antarmuka bagi admin untuk melihat laporan tagihan, mengatur master data (pengguna & tarif), dan memantau status kuota.

---

## 2. Alur Kerja Inti (*Core Workflows*)

### A. Alur Pemrosesan CDR (Billing Calculation)
1. **Data Ingestion**: File CDR (.csv) hasil unduhan Cisco CUCM diletakkan (secara manual/otomatis) ke folder `backend/uploads/cdr/incoming`.
2. **File Watcher**: Modul `cdrImporter.js` secara otomatis mendeteksi file baru dan memprosesnya baris demi baris.
3. **Raw Storage**: Baris mentah disimpan ke tabel `cdr_raw` sebagai *audit trail*.
4. **Rating & Classification** (`BillingService.processRecord`):
   - **Klasifikasi**: Tujuan panggilan dianalisa (Internal, National, International).
   - **Pemetaan Pengguna**: Nomor penelepon (`callingPartyNumber`) atau Perangkat (`origDeviceName`) dicocokkan dengan tabel `master_users_extensions`.
   - **Perhitungan Harga**: Nomor tujuan dicocokkan menggunakan metode *Longest Prefix Match* terhadap tabel `master_tariffs` untuk mendapatkan *rate per second*. (Biaya = Durasi * Rate).
5. **Processed Storage**: Hasil kalkulasi bersih disimpan ke tabel `calls_processed`.

### B. Alur Penguncian Kuota Otomatis (Quota Restriction)
1. **Trigger**: Setiap kali *file* CSV selesai diproses, sistem akan memanggil fungsi `evaluateUserQuotas()`.
2. **Evaluasi Bulan Berjalan**: Sistem menjumlahkan total biaya di tabel `calls_processed` untuk **bulan berjalan saja** (tanggal 1 hingga akhir bulan) untuk setiap pengguna.
3. **Pengecekan Limit**: Jika `total biaya >= monthly_quota` DAN `is_restricted == false`:
   - Sistem menembak AXL SOAP API ke Cisco CUCM (`cucmService.restrictDevice`).
   - Merubah *Calling Search Space* (CSS) milik perangkat pengguna menjadi CSS Terbatas (misal: `Call_Everyone` - diatur via `.env`).
   - Meng-update tabel `master_users_extensions` menjadi `is_restricted = true`.

### C. Alur Reset Bulanan Otomatis (Cron Job)
1. **Trigger**: Berjalan otomatis setiap **Tanggal 1, pukul 00:01 WIB** (`cronService.js`).
2. **Aksi Pembukaan**:
   - Mencari semua pengguna di *database* dengan status `is_restricted = true`.
   - Menembak API CUCM untuk mengembalikan perangkat mereka ke CSS Normal (misal: `PSTN_Incoming` - diatur via `.env`).
   - Merubah `is_restricted = false` di *database*.
3. **Reset Otomatis**: Karena query evaluasi biaya selalu difilter berdasarkan rentang tanggal "bulan berjalan", pemakaian kuota secara otomatis kembali menjadi Rp 0.

---

## 3. Batasan Ruang Lingkup (*Scope Boundaries*)

Untuk mencegah "halusinasi" atau *over-engineering*, berikut adalah batasan mutlak dari sistem ini:

### Termasuk di Dalam Scope (In Scope):
- Menghitung biaya berdasarkan durasi x tarif (prefix).
- Mengunci/membuka perangkat langsung ke server CUCM menggunakan protokol AXL SOAP.
- Menampilkan grafik dasbor dan laporan *Invoice Engine* berbasis pengguna dan departemen.
- Manajemen Master Data (User, Ekstensi, Tarif, Tim, Departemen) lengkap dengan fitur edit kuota.
- Mengabaikan (tarif Rp0) untuk pemanggilan internal.

### TIDAK Termasuk di Dalam Scope (Out of Scope):
- **Integrasi Tarik Data Otomatis dari CUCM**: Sistem *tidak* bertugas menarik data dari CUCM melalui SFTP/FTP secara mandiri. Anggapannya, ada *script* eksternal lain atau admin yang meletakkan CSV ke dalam folder `incoming`.
- **Top-Up/Sistem Pembayaran**: Tidak ada integrasi dengan *Payment Gateway*. Kuota adalah jatah limitasi perusahaan, bukan saldo pra-bayar layaknya pulsa konsumen.
- **Sistem Login Multi-Level Rumit**: Walaupun ada layar login, aplikasi saat ini dikhususkan untuk penggunaan level *Admin Billing*, bukan *self-service portal* untuk setiap karyawan reguler.
- **Notifikasi Email/WhatsApp**: Sistem tidak mengirim pesan otomatis ke karyawan saat kuota habis (kecuali ditambahkan secara eksplisit di fase selanjutnya).

---

## 4. Struktur Database Inti
- `cdr_raw`: Log kotor dari mesin.
- `calls_processed`: Data tagihan bersih per panggilan.
- `master_users_extensions`: Data pemilik ekstensi beserta limit `monthly_quota` dan penanda `is_restricted`.
- `master_tariffs`: Harga per ketukan digit (prefix).
- `master_teams` & `master_departments`: Hierarki untuk pelaporan *Invoice Engine*.
