# CONTINUE.md — Status Pengembangan EVENT UM

Dokumen ini merangkum apa yang sudah dikerjakan, apa yang sengaja belum
dikerjakan, dan hal-hal yang perlu diperhatikan sebelum melanjutkan ke sprint
berikutnya.

## Konteks Penting

Repo ini (lokal maupun remote GitHub `pututjr/event-um`) **kosong total**
(tanpa commit, tanpa README/CONTINUE) saat sprint ini dimulai pada
2026-07-27. Tidak ditemukan riwayat "Sprint 1" sebelumnya di repo maupun di
remote. Atas persetujuan pengguna, seluruh proyek dibangun dari nol pada
sesi ini, mencakup baseline dasar (auth, skema data, CRUD kegiatan minimal)
sekaligus fokus Sprint 2 yang diminta.

Jika project "Sprint 1" yang sebenarnya ternyata ada di lokasi/repo lain,
pertimbangkan untuk membandingkan/merge alih-alih melanjutkan dari baseline
ini.

## Sprint 2.5 — Selesai (2026-07-27)

Fokus murni infrastruktur: migrasi database dari SQLite ke PostgreSQL
(Supabase). **Tidak ada perubahan** pada UI, alur CRUD, Dashboard, Import
Excel, atau Riwayat Kegiatan — hanya lapisan database & konfigurasi deploy.

### Yang diubah
- `prisma/schema.prisma`: `datasource db` diganti dari `sqlite` menjadi
  `postgresql`, ditambah `directUrl = env("DIRECT_URL")` (pola standar
  Supabase: `DATABASE_URL` lewat connection pooler untuk runtime, `DIRECT_URL`
  koneksi langsung khusus untuk `prisma migrate`). **Struktur tabel/model
  tidak diubah sama sekali** — hanya provider datasource.
- Migration lama (`prisma/migrations/20260726183536_init`, dialek SQLite)
  dihapus dan diganti migration baru bergaya PostgreSQL
  (`prisma/migrations/20260727000000_init/migration.sql`), dihasilkan dengan
  `prisma migrate diff --from-empty --to-schema-datamodel ... --script` —
  perintah ini membandingkan skema secara lokal tanpa perlu koneksi database
  live, sehingga SQL yang dihasilkan bisa diverifikasi sebelum benar-benar
  disambungkan ke Supabase.
- `.env.example` & `.env`: diganti ke format connection string Supabase
  (`DATABASE_URL` pooler port 6543 + `pgbouncer=true`, `DIRECT_URL` direct
  port 5432).
- `package.json`: tambah script `postinstall` (`prisma generate` otomatis
  setelah `npm install`), `db:migrate:dev`, `db:migrate:deploy`, `db:seed`,
  `db:studio` — untuk mempermudah alur deploy production.
- `prisma/dev.db` (file SQLite lama) dihapus dari working directory.
- README.md: bagian Tech Stack, setup lokal, skrip, dan bagian baru
  "Deployment ke Production (Supabase)".

### Project Supabase yang digunakan
Ditemukan project Supabase bernama **event-um**
(ref `bhuygyygffwjunwaaodj`, region `ap-southeast-1`, Postgres 17,
status `ACTIVE_HEALTHY`, dibuat 2026-07-26) — kemungkinan besar ini project
yang dimaksud untuk aplikasi ini.

### ⚠️ Migrasi database BELUM dijalankan secara live
Sesuai arahan pengguna (ditanya lewat AskUserQuestion karena password
database Supabase tidak bisa diambil lewat CLI/API — hanya bisa di-reset),
opsi yang dipilih adalah **"Siapkan config saja, jangan migrate live"**.
Artinya:
- Schema, migration SQL, env template, dan script deploy sudah siap dipakai.
- `prisma migrate deploy`/`prisma migrate dev` **belum pernah dijalankan**
  terhadap database Supabase yang sesungguhnya — migration SQL di atas baru
  divalidasi secara lokal (diff dari skema kosong), belum diterapkan ke
  server.
- **Langkah lanjutan (perlu dilakukan manusia atau sesi berikutnya dengan
  kredensial):**
  1. Isi `<password>` dan sesuaikan host di `.env` dengan connection string
     asli dari Supabase Dashboard → Project Settings → Database.
  2. Jalankan `npm run db:migrate:deploy` (atau `db:migrate:dev` untuk dev)
     agar tabel benar-benar dibuat di Supabase.
  3. Jalankan `npm run db:seed` bila perlu data awal.
  4. Set env var yang sama (`DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`) di
     platform hosting produksi.

### Verifikasi Sprint 2.5
- `npm run lint` — bersih.
- `npm run build` — sukses (exit code 0). Build memunculkan log
  `prisma:error ... Authentication failed` saat tahap "Generating static
  pages" karena `.env` lokal masih placeholder tanpa password asli — ini
  **tidak menggagalkan build**: semua route memang dirender dinamis
  (server-rendered on demand), Next.js hanya sempat mencoba pre-render lalu
  otomatis fallback. Log ini akan hilang begitu env var production valid.
- Fitur Sprint 2 (CRUD Peserta, Import Excel, Dashboard Peserta, Riwayat
  Kegiatan) **tidak diuji ulang lewat browser** pada sprint ini karena tidak
  ada database live untuk disambungkan — tidak ada perubahan kode pada
  fitur-fitur tersebut sama sekali, jadi risiko regresi terbatas pada
  kesalahan konfigurasi koneksi, bukan logika aplikasi. **Wajib** dites ulang
  end-to-end sekali database Supabase tersambung dan migration dijalankan.

## Sprint 2 — Selesai (2026-07-27)

### 1. CRUD Peserta (Admin)
- List peserta dengan pencarian (nama/email/instansi/unit) dan pagination —
  [src/app/admin/peserta/page.tsx](src/app/admin/peserta/page.tsx)
- Tambah peserta — otomatis membuat akun login (`User` role `PESERTA`) +
  profil `Peserta`, password sementara ditampilkan sekali ke admin (belum ada
  email/WA untuk mengirim otomatis) —
  [src/app/admin/peserta/baru/page.tsx](src/app/admin/peserta/baru/page.tsx)
- Detail/ubah data, reset password, hapus peserta (cascade menghapus akun +
  pendaftaran terkait) —
  [src/app/admin/peserta/[id]/page.tsx](src/app/admin/peserta/[id]/page.tsx)

### 2. Import Peserta dari Excel (.xlsx)
- Halaman upload + link unduh template —
  [src/app/admin/peserta/import/page.tsx](src/app/admin/peserta/import/page.tsx)
- Parsing via SheetJS (`xlsx`), kolom: `Nama Lengkap`, `Email`, `No HP`,
  `Instansi`, `Unit/Prodi`, `Jenis Peserta` —
  [src/lib/actions/import-peserta.ts](src/lib/actions/import-peserta.ts)
- Baris dengan email kosong/tidak valid/duplikat/sudah terdaftar dilewati dan
  dilaporkan per baris (nomor baris + alasan). Seluruh peserta hasil import
  satu batch berbagi satu password sementara yang ditampilkan sekali ke admin.

### 3. Dashboard Peserta
- Ringkasan (stat cards) — [src/app/dashboard/page.tsx](src/app/dashboard/page.tsx)
- Riwayat Kegiatan (lihat poin 4) —
  [src/app/dashboard/riwayat/page.tsx](src/app/dashboard/riwayat/page.tsx)
- Kegiatan Aktif + tombol "Daftar" (menghormati kuota) —
  [src/app/dashboard/aktif/page.tsx](src/app/dashboard/aktif/page.tsx)
- Sertifikat Saya — **placeholder** sesuai instruksi (belum ada generate
  sertifikat) — [src/app/dashboard/sertifikat/page.tsx](src/app/dashboard/sertifikat/page.tsx)
- Profil — lihat & ubah data diri + ganti password —
  [src/app/dashboard/profil/page.tsx](src/app/dashboard/profil/page.tsx)

### 4. Riwayat Kegiatan dengan status
- Enum `StatusPendaftaran`: `TERDAFTAR` → `HADIR` → `SERTIFIKAT_TERBIT`
  ([prisma/schema.prisma](prisma/schema.prisma))
- Peserta mendaftar sendiri lewat "Kegiatan Aktif" → status awal `TERDAFTAR`
- Admin mengubah status secara manual per peserta di halaman detail kegiatan
  (dropdown) — [src/app/admin/kegiatan/[id]/page.tsx](src/app/admin/kegiatan/[id]/page.tsx),
  [src/lib/actions/kegiatan.ts](src/lib/actions/kegiatan.ts)
  (belum ada absensi QR/otomatis — perubahan status murni manual input admin)

### Baseline pendukung (dibangun agar 4 fokus di atas bisa berjalan)
- Skema Prisma: `User`, `Peserta`, `Kegiatan`, `Pendaftaran`
  ([prisma/schema.prisma](prisma/schema.prisma))
- Autentikasi credentials (NextAuth v5, JWT session, role `ADMIN`/`PESERTA`)
  — [src/auth.ts](src/auth.ts), guard di [src/lib/guards.ts](src/lib/guards.ts)
- CRUD Kegiatan minimal (create/edit/list) agar ada data untuk "Kegiatan
  Aktif" dan alur pendaftaran — [src/app/admin/kegiatan](src/app/admin/kegiatan)
- Seed data: 1 admin, 2 peserta, 2 kegiatan, 3 pendaftaran contoh (mencakup
  ketiga status) — [prisma/seed.ts](prisma/seed.ts)

## Sengaja TIDAK dikerjakan (sesuai instruksi)

- **Sertifikat** — generate/desain PDF sertifikat (halaman "Sertifikat Saya"
  baru placeholder)
- **Google Drive** — penyimpanan/ekspor file ke Drive
- **QR Code** — absensi/verifikasi via QR
- **Email** — pengiriman notifikasi/password otomatis via email
- **WhatsApp** — notifikasi via WhatsApp
- **Workflow** — otomasi proses (approval, pipeline sertifikasi otomatis, dsb.)

Karena email/WA belum ada, distribusi password (peserta baru & hasil import)
masih manual — admin melihat password di layar lalu menyampaikannya sendiri.
Peserta bisa mengganti password sendiri lewat halaman Profil.

## Verifikasi

- `npm run lint` — bersih (0 error/warning)
- `npm run build` — sukses (Next.js 16, Turbopack)
- Pengujian manual via browser (login admin & peserta, CRUD peserta, kelola
  kegiatan, update status pendaftaran, dashboard 4 section, daftar kegiatan)
  — semua berjalan sesuai ekspektasi.
- Import Excel diverifikasi pada level logika parsing (skrip Node terpisah
  mengonfirmasi pembacaan kolom & pencocokan header sudah sesuai
  `readCell()` di `import-peserta.ts`); upload file lewat UI browser **belum**
  diuji end-to-end karena tool browser yang tersedia di sesi ini tidak
  mendukung simulasi pemilihan file pada `<input type="file">`. Disarankan
  uji manual sekali oleh manusia sebelum dipakai produksi.

## Saran Sprint Berikutnya

- **Prioritas:** lengkapi kredensial Supabase di `.env`/hosting lalu jalankan
  `npm run db:migrate:deploy` + `npm run db:seed`, kemudian uji ulang seluruh
  fitur Sprint 2 end-to-end di atas database Postgres yang sesungguhnya.
- Sertifikat: generate PDF (mis. template + data peserta/kegiatan), simpan
  ke storage, ubah status pendaftaran ke `SERTIFIKAT_TERBIT` otomatis setelah
  terbit.
- QR Code: check-in kehadiran otomatis (ubah `TERDAFTAR` → `HADIR`).
- Notifikasi email/WhatsApp: kirim password akun baru & pengingat kegiatan.
- Workflow: otomasi status pendaftaran mengikuti tahapan kegiatan (mis. auto
  `HADIR` saat check-in, auto proses sertifikat setelah kegiatan `SELESAI`).
- Pertimbangkan uji end-to-end otomatis (Playwright) untuk form upload file,
  yang tidak bisa diuji lewat tool browser pada sesi ini.
