# EVENT UM

Sistem manajemen kegiatan dan peserta untuk Universitas Negeri Malang.

## Tech Stack

- [Next.js 16](https://nextjs.org) (App Router, TypeScript, Turbopack)
- [Prisma 6](https://www.prisma.io/) + SQLite (dev)
- [Auth.js / NextAuth v5](https://authjs.dev/) — autentikasi credentials (email + password)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [SheetJS (`xlsx`)](https://github.com/SheetJS/sheetjs) — import data peserta dari Excel
- [Zod](https://zod.dev/) + [React Hook Form](https://react-hook-form.com/) helpers untuk validasi

> Catatan versi: Prisma sengaja dipin ke v6 (bukan v7) karena Prisma 7 mengubah cara
> konfigurasi datasource (butuh `prisma.config.ts` + driver adapter) yang menambah
> kompleksitas tanpa manfaat untuk skala proyek ini.

## Menjalankan secara lokal

1. Install dependencies:

   ```bash
   npm install
   ```

2. Salin `.env.example` menjadi `.env` dan sesuaikan bila perlu:

   ```bash
   cp .env.example .env
   ```

3. Jalankan migrasi database (SQLite, file `prisma/dev.db`):

   ```bash
   npx prisma migrate dev
   ```

4. Isi data awal (akun admin + contoh peserta/kegiatan):

   ```bash
   npx prisma db seed
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

| Perintah          | Keterangan                                   |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | Menjalankan development server                |
| `npm run build`   | Build production                              |
| `npm run start`   | Menjalankan hasil build                       |
| `npm run lint`    | Menjalankan ESLint                            |
| `npx prisma studio` | Membuka GUI untuk melihat/mengedit data DB  |

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
