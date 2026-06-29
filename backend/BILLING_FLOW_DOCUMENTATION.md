# Dokumentasi Alur Data Billing System

Dokumentasi ini menjelaskan bagaimana data mentah dari **Cisco Unified Communications Manager (CUCM)** diolah menjadi data billing yang siap digunakan untuk pelaporan.

---

## 1. Master Data (Fondasi)

Sistem bergantung pada dua tabel master utama untuk melakukan klasifikasi dan perhitungan biaya:

### 📱 `master_users_extensions`
*Menghubungkan identitas fisik telepon dengan pemiliknya.*
*   **Fungsi**: Digunakan untuk mapping siapa yang melakukan panggilan dan ke departemen mana biaya harus dialokasikan.
*   **Key Fields**:
    *   `extension`: Nomor unik telepon (Primary Key lookup).
    *   `name`: Nama karyawan.
    *   `department` & `cost_center`: Metadata untuk laporan alokasi biaya.
    *   `device_name`: ID Perangkat (contoh: `SEP...`). Backup jika extension tidak ditemukan.

### `master_tariffs`
*Aturan biaya per jenis panggilan.*
*   **Fungsi**: Menentukan tarif per detik berdasarkan awalan nomor tujuan.
*   **Key Fields**:
    *   `prefix`: Awalan nomor (contoh: `08` untuk Mobile, `00` untuk International).
    *   `call_type`: Kategori (Internal, National, International, dsb).
    *   `rate_per_second`: Harga yang dikalikan dengan durasi bicara.

---

## 2. Proses Pengolahan Data (`calls_processed`)

Setiap baris CDR yang masuk akan melewati 4 tahap pemrosesan otomatis:

### Step 1: Klasifikasi (Classification)
Sistem menganalisa nomor tujuan (`finalCalledPartyNumber`):
*   **Internal**: Panjang nomor <= 5 digit.
*   **International**: Diawali `00` atau `+`.
*   **National**: Diawali `0` (bukan 00).

### Step 2: Mapping User (Identification)
Sistem mencari pemilik extension di tabel `master_users_extensions`:
1. Cari berdasarkan `extension`.
2. Jika tidak ada, cari berdasarkan `device_name` (origDeviceName).
3. Jika ditemukan, `user_id` akan dicatat. Jika tidak, tetap diproses sebagai "Unknown User".

### Step 3: Perhitungan Biaya (Rating)
*   **Internal**: Otomatis **Rp 0**.
*   **Luar**: Menggunakan logic **Best Match Prefix**.
    *   Jika menelepon `0812...`, sistem mencari tarif `0812`. Jika tidak ada, turun ke `081`, lalu `08`.
    *   **Total Cost = Duration x Rate Per Second**.

### Step 4: Analisa Status (Health Check)
*   Jika durasi `0` dan penyebabnya bukan *Normal Clearing* (Cause 16), maka status ditandai sebagai **Abnormal**.

---

## 3. Kamus Data `calls_processed`

| Kolom | Deskripsi |
| :--- | :--- |
| `call_id` | ID Referensi ke data asli di `cdr_raw`. |
| `normalized_time` | Waktu tersambung (format Date/Time standar). |
| `duration` | Lama bicara (detik). |
| `caller_extension` | Nomor penelepon. |
| `destination_number` | Nomor yang dituju. |
| `call_type` | Kategori (Internal/National/International). |
| `user_id` | Pemilik telepon (FK ke master user). |
| `cost` | Hasil perhitungan biaya (IDR). |
| `status` | Kondisi panggilan (Normal/Abnormal). |

---

## 4. Arsitektur Tabel CDR

1.  **`cdr_raw` (The Vault)**: Menyimpan 120+ kolom asli dari Cisco tanpa modifikasi. Digunakan untuk audit dan bukti hukum jika ada selisih biaya.
2.  **`calls_processed` (The Report)**: Data hasil olahan yang sudah bersih, ringkas, dan sudah ada harganya. Digunakan oleh API Dashboard agar query lebih cepat.

---

## 5. API Endpoints & Data Lineage

| Endpoint | Deskripsi | Sumber Data & Logic |
| :--- | :--- | :--- |
| `/invoice-user` | Tagihan per orang | `calls_processed` JOIN `user`. Group by User ID. |
| `/invoice-dept` | Tagihan per Dept | `calls_processed` JOIN `user`. Group by Department. |
| `/top-callers` | Penelepon Teraktif | Top 10 by `SUM(duration)`. |
| `/utilization` | Tren Harian | Group by `DATE(normalized_time)`. |
| `/summary` | Alokasi Biaya | Group by `call_type` (Internal vs External). |
