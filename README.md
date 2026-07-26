# EVENT UM

Sistem manajemen kegiatan dan peserta untuk Universitas Negeri Malang.

## Tech Stack

- [Next.js 16](https://nextjs.org) (App Router, TypeScript, Turbopack)
- [Prisma 6](https://www.prisma.io/) + [PostgreSQL via Supabase](https://supabase.com/)
- [Auth.js / NextAuth v5](https://authjs.dev/) — autentikasi credentials (email + password)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [SheetJS (`xlsx`)](https://github.com/SheetJS/sheetjs) — import data peserta dari Excel
- [Zod](https://zod.dev/) + [React Hook Form](https://react-hook-form.com/) helpers untuk validasi

> Catatan versi: Prisma sengaja dipin ke v6 (bukan v7) karena Prisma 7 mengubah cara
> konfigurasi datasource (butuh `prisma.config.ts` + driver adapter) yang menambah
> kompleksitas tanpa manfaat untuk skala proyek ini.

> Sejak Sprint 2.5, database menggunakan **PostgreSQL (Supabase)**, bukan SQLite
> lagi. Lihat [CONTINUE.md](CONTINUE.md) untuk detail migrasi.

## Database: Supabase PostgreSQL

Project Supabase yang digunakan: **event-um** (region `ap-southeast-1`).
Prisma butuh dua connection string berbeda (lihat [.env.example](.env.example)):

- `DATABASE_URL` — connection pooler ("Transaction", port `6543`,
  `pgbouncer=true&connection_limit=1`). Dipakai aplikasi saat runtime.
- `DIRECT_URL` — koneksi langsung (port `5432`, tanpa pooler). Dipakai khusus
  oleh `prisma migrate` karena PgBouncer transaction-mode tidak mendukung
  perintah DDL/migrasi.

Ambil kedua string persis dari **Supabase Dashboard → Project Settings →
Database → Connection string**, lalu ganti `<password>` dan `<region>` pada
`.env`.

## Menjalankan secara lokal

1. Install dependencies (otomatis menjalankan `prisma generate` lewat
   `postinstall`):

   ```bash
   npm install
   ```

2. Salin `.env.example` menjadi `.env`, isi `DATABASE_URL` & `DIRECT_URL`
   dengan connection string Supabase yang sebenarnya:

   ```bash
   cp .env.example .env
   ```

3. Jalankan migrasi database:

   ```bash
   npm run db:migrate:dev
   ```

4. Isi data awal (akun admin + contoh peserta/kegiatan):

   ```bash
   npm run db:seed
   ```

5. Jalankan development server:

   ```bash
   npm run dev
   ```

   Buka [http://localhost:3000](http://localhost:3000).

### Akun default (hasil seed)

| Peran   | Email                          | Password      |
| ------- | ------------------------------- | ------------- |
| Admin   | admin@um.ac.id                  | `Admin123!`   |
| Peserta | budi.santoso@um.ac.id           | `Peserta123!` |
| Peserta | siti.rahma@student.um.ac.id     | `Peserta123!` |

## Skrip

| Perintah                  | Keterangan                                          |
| ------------------------- | ---------------------------------------------------- |
| `npm run dev`             | Menjalankan development server                        |
| `npm run build`           | Build production (juga menjalankan `prisma generate`) |
| `npm run start`           | Menjalankan hasil build                                |
| `npm run lint`            | Menjalankan ESLint                                    |
| `npm run db:migrate:dev`  | Membuat & menerapkan migrasi (dev, butuh `DIRECT_URL`) |
| `npm run db:migrate:deploy` | Menerapkan migrasi ke production (butuh `DIRECT_URL`) |
| `npm run db:seed`         | Mengisi data awal                                      |
| `npm run db:studio`       | Membuka GUI untuk melihat/mengedit data DB             |

## Deployment ke Production (Supabase)

1. **Siapkan project Supabase** — pastikan project Postgres sudah dibuat
   (project `event-um` sudah tersedia di Supabase).
2. **Set environment variables** di platform hosting (Vercel/lainnya):
   `DATABASE_URL`, `DIRECT_URL` (lihat format di atas), dan `AUTH_SECRET`
   (generate baru untuk production, jangan pakai nilai contoh/dev — misalnya
   dengan `npx auth secret`).
3. **Install & build** — `npm install` otomatis menjalankan `prisma generate`
   lewat hook `postinstall`, sehingga Prisma Client selalu sesuai skema
   sebelum `npm run build` dijalankan.
4. **Terapkan migrasi** ke database production — jalankan sekali (manual atau
   sebagai release step di CI/CD):

   ```bash
   npm run db:migrate:deploy
   ```

   Perintah ini memakai `DIRECT_URL` (bukan pooler) karena PgBouncer di mode
   transaction tidak mendukung perintah DDL.
5. **(Opsional) Seed data awal** — hanya untuk environment baru:

   ```bash
   npm run db:seed
   ```

> Catatan: `next build` akan memunculkan log `prisma:error ... Authentication
> failed` di tahap "Generating static pages" jika `DATABASE_URL`/`DIRECT_URL`
> belum valid saat build lokal tanpa akses ke database. Ini **tidak
> menyebabkan build gagal** — seluruh route memang dirender dinamis
> (server-rendered on demand), Next.js hanya mencoba mendeteksi apakah route
> bisa dijadikan statis lalu otomatis fallback ke dinamis. Pastikan env var
> valid di production agar log ini tidak muncul.

## Struktur Aplikasi

```
src/
  app/
    login/                  Halaman login
    admin/                  Area admin (role ADMIN)
      peserta/              CRUD peserta, import Excel
      kegiatan/             CRUD kegiatan + kelola status pendaftaran
    dashboard/               Area peserta (role PESERTA)
      riwayat/               Riwayat kegiatan (status: Terdaftar/Hadir/Sertifikat Terbit)
      aktif/                 Kegiatan aktif + tombol daftar
      sertifikat/            Placeholder "Sertifikat Saya"
      profil/                Profil peserta + ganti password
  lib/
    actions/                 Server Actions (mutasi data)
    validation/               Skema Zod
    prisma.ts                 Prisma client singleton
    guards.ts                  Helper otorisasi berbasis role
  auth.ts                     Konfigurasi NextAuth (credentials provider)
prisma/
  schema.prisma               Skema database
  seed.ts                     Skrip seed data awal
```

## Status Pengembangan

Lihat [CONTINUE.md](CONTINUE.md) untuk status sprint, fitur yang sudah/belum
dikerjakan, dan rencana lanjutan.
