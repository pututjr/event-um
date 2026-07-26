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

## UI Refactor — Design System "Prakerin" — Selesai (2026-07-27)

Refactor tampilan murni (visual-only) di seluruh aplikasi agar konsisten
dengan nuansa dashboard Prakerin. **Tidak ada perubahan** pada business
logic, skema database, Prisma, routing, atau authentication — hanya markup
JSX dan className yang diubah/diganti dengan komponen UI bersama.

### Design tokens
- [src/app/globals.css](src/app/globals.css): warna `navy` (#12304A),
  `navy-light`, `navy-dark`, `page` (#F5F7FB) didaftarkan sebagai Tailwind
  utility lewat `@theme`. Mode dark otomatis (`prefers-color-scheme`)
  dihapus — dashboard ini memakai tema terang tetap, konsisten dengan
  referensi desain.
- Icon: [lucide-react](https://lucide.dev/) dipakai di sidebar, tombol, dan
  stat card.

### Komponen UI bersama (baru) — `src/components/ui/`
- `styles.ts` — konstanta className (input, select, textarea, table, card)
- `button.tsx` / `link-button.tsx` — varian primary (navy) / secondary
  (putih border abu) / danger (merah) / success (hijau)
- `page-header.tsx` — header card gradient biru tua per halaman
- `content-card.tsx` — card putih rounded-xl shadow tipis border tipis
- `action-bar.tsx` — baris aksi (search + tombol)
- `stat-card.tsx` — card statistik berwarna (blue/purple/green/pink)
- `form-field.tsx` — input/select/textarea seragam (lebih tinggi, radius 10px)
- `back-link.tsx` — link "kembali" dengan ikon panah

### Layout baru — `src/components/layout/`
- `sidebar.tsx` — sidebar kiri fixed biru tua (`#12304A`) untuk desktop/
  tablet, dengan fallback top bar horizontal untuk mobile (nav + logout tetap
  bisa diakses, sesuai arahan "mobile cukup usable")
- `page-shell.tsx` — pembungkus konten di kanan sidebar
- `src/components/app-shell.tsx` (versi lama, top nav) **dihapus**,
  digantikan sepenuhnya oleh `PageShell` + `Sidebar`

### Halaman yang direstyle (logika/query/action tidak diubah)
Login, Admin (Peserta: list/baru/detail/import — termasuk halaman template
xlsx tidak disentuh karena itu route handler biner, bukan tampilan; Kegiatan:
list/baru/detail), Dashboard Peserta (Ringkasan, Riwayat Kegiatan, Kegiatan
Aktif, Sertifikat Saya, Profil). Semua memakai pola yang sama: Sidebar tetap
(dari layout) → `PageHeader` → (opsional) `StatCard` → `ActionBar` → `Content
Card`/tabel.

### Perubahan kecil yang murni presentasional
- `src/lib/labels.ts` (baru): peta label `JenisPeserta` ("Mahasiswa", dst.)
  dipakai bersama oleh halaman admin Peserta dan Profil peserta (sebelumnya
  duplikat inline di `dashboard/profil/page.tsx`) — nilai/enum tidak berubah,
  hanya cara menampilkannya.
- `status-badge.tsx`, `pendaftaran-status-select.tsx`,
  `reset-password-button.tsx`: className diperbarui ke gaya baru, prop/
  behavior tidak berubah.

### Verifikasi
- `npm run lint` — bersih.
- `npm run build` — sukses, seluruh route tetap dinamis seperti sebelumnya
  (tidak ada perubahan routing).
- Smoke test browser (login admin & peserta, list/detail Peserta & Kegiatan,
  ke-5 halaman Dashboard Peserta) — struktur & data tampil benar, tidak ada
  error console. Layout mobile (375px) dicek: top bar navigasi dan form
  tetap dapat diakses.
- Screenshot visual **tidak** bisa diambil pada sesi ini (Browser pane tidak
  ditampilkan di sisi pengguna) — verifikasi dilakukan lewat pembacaan
  struktur DOM/teks halaman. Disarankan pengguna mengecek tampilan secara
  visual langsung sekali sebelum dianggap final.

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

### ✅ Migrasi database sudah diterapkan secara live (update 2026-07-27)

Setelah pengguna mengisi `DATABASE_URL`/`DIRECT_URL` dengan connection string
Supabase yang sebenarnya, migrasi dijalankan dan diverifikasi:

- `npm run db:migrate:deploy` → migration `20260727000000_init` berhasil
  diterapkan ke database Supabase (`aws-0-ap-southeast-1.pooler.supabase.com`).
- Keempat tabel (`User`, `Peserta`, `Kegiatan`, `Pendaftaran`) dikonfirmasi
  benar-benar ada dan bisa diquery lewat Prisma Client (`npm run db:verify`,
  skrip di [scripts/verify-db.ts](scripts/verify-db.ts)), sebelum dan sesudah
  `npm run db:seed` (0 baris → 3 User / 2 Peserta / 2 Kegiatan / 3 Pendaftaran,
  sesuai [prisma/seed.ts](prisma/seed.ts)).
- `npm run lint` dan `npm run build` sukses tanpa error koneksi.
- Smoke test manual di browser (list Peserta & Kegiatan) menampilkan data
  seed dengan benar dari Supabase.

**Bug konfigurasi yang ditemukan & diperbaiki:** nilai awal yang diisi
pengguna menempatkan koneksi **direct** (`db.<ref>.supabase.co:5432`) di
`DATABASE_URL` — host ini tidak bisa di-*resolve* dari environment ini
(kemungkinan besar direct connection Supabase bersifat IPv6-only, keterbatasan
umum di banyak jaringan/hosting). Migrasi tetap berhasil karena `DIRECT_URL`
kebetulan sudah menunjuk ke *session pooler* (IPv4). `DATABASE_URL` diperbaiki
untuk memakai *transaction pooler* Supabase yang sama
(`aws-0-ap-southeast-1.pooler.supabase.com:6543` + `pgbouncer=true`) —
sesuai pola yang sudah didokumentasikan di `.env.example` sejak awal.
Pastikan environment variable di platform hosting produksi juga memakai host
pooler ini untuk `DATABASE_URL`, bukan host direct.

### Verifikasi Sprint 2.5 (config) + migrasi live (update)
- `npm run lint` — bersih.
- `npm run build` — sukses (exit code 0), tanpa error koneksi setelah
  `DATABASE_URL` diperbaiki ke host pooler yang benar.
- Migrasi & seed sudah dijalankan terhadap Supabase sungguhan (lihat bagian
  "✅ Migrasi database sudah diterapkan secara live" di atas).
- Fitur Sprint 2 di-spot-check ulang lewat browser di atas database Supabase
  yang sesungguhnya: list Peserta (2 data seed) dan list Kegiatan (2 data
  seed) tampil benar. Tidak ada perubahan kode pada fitur-fitur Sprint 2,
  jadi cakupan smoke test ini cukup — bukan full regression run.
- Upload file Excel (Import Peserta) tetap belum diuji end-to-end lewat UI
  karena tool browser di sesi ini tidak bisa mensimulasikan pemilihan file
  pada `<input type="file">` — sama seperti dicatat di Sprint 2. Disarankan
  uji manual oleh manusia.

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

- **Prioritas:** set env var produksi (`DATABASE_URL` ke host *pooler*, bukan
  direct) di platform hosting, lalu jalankan `npm run db:migrate:deploy` di
  sana juga. Pertimbangkan uji manual upload Excel (belum bisa diuji otomatis
  di sesi ini).
- Sertifikat: generate PDF (mis. template + data peserta/kegiatan), simpan
  ke storage, ubah status pendaftaran ke `SERTIFIKAT_TERBIT` otomatis setelah
  terbit.
- QR Code: check-in kehadiran otomatis (ubah `TERDAFTAR` → `HADIR`).
- Notifikasi email/WhatsApp: kirim password akun baru & pengingat kegiatan.
- Workflow: otomasi status pendaftaran mengikuti tahapan kegiatan (mis. auto
  `HADIR` saat check-in, auto proses sertifikat setelah kegiatan `SELESAI`).
- Pertimbangkan uji end-to-end otomatis (Playwright) untuk form upload file,
  yang tidak bisa diuji lewat tool browser pada sesi ini.
