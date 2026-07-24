# Deployment terbaru — Railway

Panduan ini untuk struktur project saat ini:

```text
koperasi-rofis/
├── server/   # Express API + migrasi PostgreSQL otomatis
├── web/      # React + Vite
└── mobile/   # Capacitor Android
```

> Tidak menggunakan Docker dan tidak perlu menjalankan file SQL secara manual.

## 1. Upload source ke GitHub

1. Buat repository GitHub baru, misalnya `koperasi-rofis`.
2. Upload **isi folder** project ini ke repository tersebut.
3. Jangan upload file `.env`, `node_modules`, `web/dist`, atau `mobile/output`.

## 2. Buat project dan PostgreSQL

1. Masuk ke [Railway](https://railway.app), kemudian buat **New Project**.
2. Pilih **Add Service → Database → PostgreSQL**.
3. Ubah nama service PostgreSQL menjadi `Postgres` agar mudah mengikuti contoh variable di bawah.

Railway akan membuat database secara otomatis. Tidak perlu membuat `rofis_db` di Railway secara manual.

## 3. Deploy backend Express

1. Di project Railway, pilih **Add Service → GitHub Repo**, lalu pilih repository Anda.
2. Pada service backend, buka **Settings** dan atur:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
3. Pada tab **Variables**, isi variable berikut:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
PORT=3000
JWT_SECRET=ganti-dengan-random-string-rahasia-minimal-32-karakter
DB_SSL=false
```

`DATABASE_URL` adalah referensi ke service PostgreSQL Railway. Tidak perlu memakai `DB_NAME`, `DB_USERNAME`, dan `DB_PASSWORD` saat deploy ke Railway.

4. Klik **Deploy**.
5. Setelah sukses, buka **Settings → Networking → Generate Domain**. Simpan URL backend, misalnya:

```text
https://koperasi-rofis-api-production.up.railway.app
```

6. Tes backend:

```text
https://koperasi-rofis-api-production.up.railway.app/api/health
```

Respons yang benar:

```json
{"status":"ok"}
```

### Migrasi database otomatis

Ketika backend pertama kali hidup, aplikasi otomatis membuat/memperbarui tabel, index, akun admin awal, dan kategori awal. Tidak ada perintah SQL tambahan yang perlu dijalankan.

Akun awal:

```text
Email    : admin@rofis.local
Password : admin123
```

Segera buat akun admin baru atau ubah password setelah berhasil login.

## 4. Deploy frontend React

1. Di Railway pilih **Add Service → GitHub Repo** lagi dan pilih repository yang sama.
2. Atur service frontend:
   - **Root Directory:** `web`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
3. Tambahkan variable berikut **sebelum melakukan deploy**:

```env
VITE_API_URL=https://koperasi-rofis-api-production.up.railway.app/api
```

Ganti URL tersebut dengan domain backend Railway Anda sendiri.

4. Deploy frontend.
5. Setelah berhasil, buat domain publik dari **Settings → Networking → Generate Domain**. Contoh:

```text
https://koperasi-rofis-web-production.up.railway.app
```

## 5. Atur CORS backend

Kembali ke service backend, isi/perbarui variable `CORS_ORIGIN` dengan domain frontend dan origin aplikasi Capacitor, dipisahkan koma tanpa spasi:

```env
CORS_ORIGIN=https://koperasi-rofis-web-production.up.railway.app,http://localhost,https://localhost
```

Ganti domain frontend sesuai domain Railway Anda, lalu pilih **Redeploy** pada backend.

Untuk testing sementara saja, Anda dapat memakai:

```env
CORS_ORIGIN=*
```

Untuk production sebaiknya gunakan daftar domain spesifik seperti contoh sebelumnya.

## 6. Build Android yang terhubung ke Railway

Aplikasi Android memaketkan hasil build React. Saat ingin memakai API Railway (bukan IP Wi-Fi lokal), di komputer Anda ubah `web/.env` menjadi:

```env
VITE_API_URL=https://koperasi-rofis-api-production.up.railway.app/api
```

Lalu jalankan:

```bash
cd web
npm install
npm run build

cd ../mobile
npm install
npm run build:apk:debug
```

APK tersedia di:

```text
mobile/output/koperasi-rofis-debug.apk
```

Untuk APK production/Play Store, buka proyek dengan `npm run android`, lalu gunakan Android Studio: **Build → Generate Signed Bundle / APK**.

## Checklist jika terjadi error

| Kondisi | Periksa |
|---|---|
| Frontend tidak bisa login | `VITE_API_URL` harus diakhiri `/api`; lalu redeploy frontend. |
| Request Android/web diblokir | Pastikan `CORS_ORIGIN` berisi domain frontend dan `http://localhost,https://localhost`; redeploy backend. |
| Backend gagal connect database | Pastikan `DATABASE_URL=${{Postgres.DATABASE_URL}}` dan `DB_SSL=false`. |
| Tabel belum ada | Lihat **Deploy Logs** backend; migrasi otomatis berjalan sebelum API mendengarkan port. |
| URL API berubah | Ubah `VITE_API_URL`, lalu build/redeploy frontend dan build ulang APK Android. |

## Perbedaan environment lokal dan Railway

| Lokal | Railway |
|---|---|
| Menggunakan `DB_HOST`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD` pada `server/.env` | Menggunakan `DATABASE_URL` dari Railway PostgreSQL |
| API dapat memakai IP Wi-Fi, contoh `http://192.168.1.12:3000/api` | API wajib memakai domain HTTPS Railway |
| `CORS_ORIGIN=*` boleh untuk testing LAN | Gunakan domain spesifik pada production |
