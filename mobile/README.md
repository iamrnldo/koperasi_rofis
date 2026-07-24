# Android Koperasi Rofis — Wi-Fi Lokal

Aplikasi Android ini dapat dipasang di HP dan terhubung ke backend Express pada laptop/PC lewat router Wi-Fi yang sama. Aplikasi Android memaketkan frontend React; hanya API (`port 3000`) yang diakses lewat jaringan lokal.

## 1. Pastikan perangkat satu Wi-Fi
Laptop/PC yang menjalankan backend dan HP Android harus terhubung ke router Wi-Fi yang sama. Jangan pakai `localhost` pada HP—`localhost` di HP berarti HP itu sendiri.

## 2. Cari IP lokal komputer backend
- **Windows:** buka CMD lalu jalankan `ipconfig`; lihat `IPv4 Address` dari adaptor Wi-Fi, misalnya `192.168.1.10`.
- **macOS/Linux:** jalankan `ip addr` atau `ifconfig`.

Contoh di panduan ini memakai `192.168.1.10`; ganti dengan IP komputer Anda.

## 3. Atur backend
Pada `server/.env` gunakan:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rofis_db
DB_USERNAME=postgres
DB_PASSWORD=password_anda
JWT_SECRET=rahasia-panjang-anda
CORS_ORIGIN=*
```

`CORS_ORIGIN=*` hanya untuk development di Wi-Fi yang dipercaya. Jalankan backend:

```bash
cd server
npm run dev
```

Izinkan Node.js / TCP port **3000** melalui Windows Firewall bila diminta. Dari browser HP, buka `http://192.168.1.10:3000/api/health`. Jika respons `{"status":"ok"}`, koneksi LAN sudah benar.

## 4. Build frontend untuk alamat API LAN
Di `web/.env`, isi alamat IP laptop/PC, bukan localhost:

```env
VITE_API_URL=http://192.168.1.10:3000/api
```

Lalu build:

```bash
cd web
npm install
npm run build
```

> Jika IP laptop berubah (misalnya router memberi IP baru), ubah `VITE_API_URL`, build ulang, lalu sync Android lagi. Sebaiknya buat DHCP reservation/static IP di router.

## 5. Buat APK debug dengan satu perintah

Setelah `web/.env` diisi IP API lokal, cukup jalankan dari folder `mobile`:

```bash
npm install # sekali saja
npm run build:apk:debug
```

Script ini otomatis menjalankan build React, sync Capacitor, build Gradle debug, dan menyalin APK ke:

```text
mobile/output/koperasi-rofis-debug.apk
```

Untuk membuka proyek di Android Studio: `npm run android`.

`cleartextTraffic` telah diaktifkan khusus agar Android mengizinkan API `http://` lokal. Untuk deployment internet/produksi, gunakan URL HTTPS dan nonaktifkan cleartext.
