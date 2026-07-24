# Koperasi Rofis — Pendataan Barang

Monorepo aplikasi inventaris koperasi: dashboard React, REST API Express + PostgreSQL, dan wrapper Android Capacitor.

## Fitur
- Login JWT dengan dua peran: **admin** (website & mobile) dan **petugas** (mobile saja)
- Manajemen pengguna khusus admin: tambah, ubah role/password, dan hapus pengguna
- CRUD barang, kategori, dan pemasok
- Transaksi barang masuk/keluar, stok otomatis, serta histori transaksi
- Dashboard ringkasan, stok menipis, dan API yang dipakai aplikasi web serta Android

## Jalankan lokal
1. Salin `server/.env.example` menjadi `server/.env`, lalu isi `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`, dan `JWT_SECRET`. Untuk Railway/Neon gunakan `DATABASE_URL` sebagai gantinya.
2. Pastikan service PostgreSQL lokal Anda sudah aktif dan database `rofis_db` sudah dibuat. Struktur tabel, index, data awal, dan upgrade skema akan dibuat otomatis saat API dijalankan.
3. `cd server && npm install && npm run dev`
4. Terminal baru: `cd web && npm install && npm run dev`

Akun awal setelah API pertama kali dijalankan: `admin@rofis.local` / `admin123` (ganti segera).

## Android
Setelah web dibuild, dari folder `mobile`: `npm install`, atur `CAPACITOR_SERVER_URL` di `.env` ke URL frontend HTTPS produksi, lalu `npm run android`. Android Studio akan membuka project untuk membuat APK/AAB. API URL diatur melalui `VITE_API_URL` ketika build web.

## Deploy Railway
Buat proyek Railway PostgreSQL lalu isi variabel `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN` pada service API. Deploy folder `server` sebagai service Node (start: `npm start`), jalankan schema SQL sekali melalui Railway CLI/query console. Deploy folder `web` sebagai service static (`npm run build`, publish `dist`) dengan `VITE_API_URL=https://URL-API-ANDA/api`. Lihat `DEPLOY_RAILWAY.md`.
