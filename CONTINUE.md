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

## Migrasi Arsitektur: NextAuth → Supabase Auth + Template Sertifikat ke Drive (2026-07-27, lanjutan)

Pengguna memberikan dokumen arsitektur baku untuk project ini (awalnya
terlihat seperti arsitektur project lain — React+Express+Railway+Supabase
Auth — tapi setelah dikonfirmasi, yang dimaksud adalah: **tetap Next.js App
Router fullstack**, hanya **authentication-nya yang diganti ke Supabase
Auth**, dan **penyimpanan file mengikuti prinsip "Google Drive = source of
truth untuk file, Supabase hanya metadata"**). Dua keputusan desain
dikonfirmasi ke pengguna sebelum eksekusi (lihat riwayat percakapan):
1. Role/profil peserta tetap di tabel Prisma (`User`/`Peserta`), tapi
   `User.id` disamakan dengan id akun `auth.users` Supabase.
2. Template Sertifikat (.docx) juga dipindah ke Google Drive — tabel
   `SertifikatTemplate` sekarang hanya simpan metadata.

### Yang diubah

**Auth (NextAuth v5 dihapus total, diganti Supabase Auth):**
- Uninstall `next-auth`, `bcryptjs`; install `@supabase/supabase-js`,
  `@supabase/ssr`.
- Hapus: `src/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`,
  `src/types/next-auth.d.ts`.
- Baru: [src/lib/supabase/server.ts](src/lib/supabase/server.ts) (client
  untuk Server Components/Actions, pakai cookies), 
  [src/lib/supabase/admin.ts](src/lib/supabase/admin.ts) (service-role
  client, server-only, untuk Admin API: buat/hapus/reset password akun
  peserta), dan [src/proxy.ts](src/proxy.ts) (proxy = middleware di Next.js
  16, refresh sesi Supabase di setiap request).
- [src/lib/guards.ts](src/lib/guards.ts) ditulis ulang: `requireRole`/
  `assertRole` sekarang memanggil `supabase.auth.getUser()` lalu join ke
  tabel Prisma `User` by id untuk ambil role. Menambahkan `getSession()`
  untuk dipakai di halaman yang cuma perlu cek sesi (login page, root
  page, download route, template Excel route) — semuanya mengembalikan
  bentuk `{ user: { id, email, role } }` yang sama seperti sebelumnya
  supaya seluruh call site (`session.user.id` dst.) tidak perlu diubah.
- `loginAction`/`logoutAction` ([src/lib/actions/auth.ts](src/lib/actions/auth.ts))
  pakai `supabase.auth.signInWithPassword`/`signOut`. Bentuk `LoginState`
  & signature tidak berubah — `login-form.tsx` tidak disentuh.
- `changePasswordAction` verifikasi password lama via
  `signInWithPassword` ulang, lalu `supabase.auth.updateUser({password})`.
- Peserta CRUD ([src/lib/actions/peserta.ts](src/lib/actions/peserta.ts),
  [import-peserta.ts](src/lib/actions/import-peserta.ts)): create pakai
  `supabase.auth.admin.createUser` (email+password sementara,
  `email_confirm: true`), lalu `prisma.user.create({ id: authUser.id, ... })`
  — kalau insert Prisma gagal setelah user Supabase berhasil dibuat, user
  Supabase-nya dihapus lagi (rollback manual, tidak ada distributed
  transaction antara Supabase Auth dan Postgres). Update email pakai
  `admin.updateUserById`. Reset password pakai `admin.updateUserById({password})`.
  Delete pakai `admin.deleteUser` + `prisma.user.delete` (cascade ke
  Peserta/Pendaftaran/Sertifikat seperti biasa).
- Import Excel massal jadi lebih lambat dari sebelumnya karena tiap baris
  sekarang melakukan 1 network call nyata ke Supabase Admin API (dulu cuma
  `bcrypt.hash` lokal) — trade-off yang melekat pada pindah ke auth
  provider eksternal, bukan bug.
- `prisma/seed.ts` ditulis ulang: bikin akun demo (admin + 2 peserta) lewat
  `supabase.auth.admin.createUser` (idempotent — kalau email sudah ada,
  cari user existing lewat `listUsers()`), baru insert/upsert Prisma `User`
  dengan `id` yang sama.

**Skema Prisma:**
- `User`: kolom `passwordHash` dihapus, `id` tidak lagi `@default(cuid())`
  (harus selalu diisi eksplisit = id Supabase Auth).
- `SertifikatTemplate`: kolom `fileData Bytes` dihapus, ganti jadi
  `driveFileId String`, `driveUrl String?`, `mimeType String` — file
  `.docx` sekarang betul-betul disimpan di Google Drive, bukan Postgres.
- Migration: `prisma/migrations/20260727010000_supabase_auth_and_drive_templates`.
  **Catatan teknis:** `prisma migrate dev` gagal karena shadow database
  tidak bisa dibuat lewat koneksi pooler Supabase (keterbatasan permission
  yang umum terjadi) — solusinya sama seperti migrasi Postgres sebelumnya:
  generate SQL dengan `prisma migrate diff --from-url ... --to-schema-datamodel ...`,
  terapkan manual lewat `prisma db execute`, lalu `prisma migrate resolve --applied`
  supaya riwayat migrasi tetap konsisten untuk `migrate deploy` di production.
- Data lama (3 User seed hasil Sprint 1-3) **dihapus** sebelum reseed,
  karena id lama (cuid) tidak mungkin cocok dengan id akun Supabase Auth
  mana pun — semua cuma data seed/demo, tidak ada data pengguna sungguhan
  yang hilang.

**Google Drive (`src/lib/google-drive.ts`):**
- `uploadPdfToDrive` digeneralisasi jadi `uploadFileToDrive(buffer, name, mimeType, folderId)`;
  `uploadPdfToDrive`/`uploadDocxToDrive` sekarang tinggal wrapper tipis.
- Tambah `deleteDriveFile(fileId)` — dipakai saat admin menghapus template
  (file di Drive ikut dihapus, bukan cuma barisnya di Postgres).
- `uploadTemplateAction` ([src/lib/actions/sertifikat.ts](src/lib/actions/sertifikat.ts))
  sekarang upload `.docx` ke Drive dulu, baru simpan metadata. `performGenerate`
  men-download template dari Drive (`downloadDriveFileBuffer`) alih-alih baca
  `template.fileData`.

### Verifikasi (live, terhadap Supabase Auth + Postgres sungguhan)
- `npm run lint` bersih, `npm run build` sukses (19 route sama seperti
  sebelumnya, tanpa route `/api/auth/[...nextauth]` lagi, plus 1 Proxy
  terdaftar).
- Migration diterapkan ke database Supabase live, tabel lama (3 seed User)
  dibersihkan, seed baru berhasil membuat akun lewat Supabase Auth
  sungguhan.
- **Login admin & peserta** (via `supabase.auth.signInWithPassword`) — sukses.
- **Buat peserta baru** dari UI admin (`/admin/peserta/baru`) — akun
  Supabase Auth beneran ter-buat, langsung bisa dipakai login.
- **Login sebagai peserta baru** dengan password sementara hasil create — sukses,
  redirect ke dashboard sesuai role.
- **Ganti password** (dari halaman Profil peserta) — verifikasi password
  lama + update ke Supabase Auth sukses; **login ulang dengan password
  baru dikonfirmasi berhasil**.
- **Hapus peserta** dari admin — akun Supabase Auth & baris Prisma
  keduanya terhapus, muncul kembali di daftar dengan jumlah berkurang.
- Upload Template Sertifikat lewat UI **belum** diuji end-to-end (tool
  browser di sesi ini tidak bisa mengisi `<input type="file">`, sama
  seperti keterbatasan yang dicatat berulang kali sebelumnya) — logika
  kode sudah direview manual dan konsisten dengan pola Peserta CRUD.

### Belum diverifikasi / masih ada dari sebelumnya
Blocker Google Drive quota (service account 0-byte storage) yang dicatat
di bagian Sprint 3 di bawah **masih berlaku** — belum berubah oleh migrasi
ini. Begitu pengguna memberikan folder ID Shared Drive yang benar, baru
upload PDF sertifikat sungguhan bisa diverifikasi live.

## Sprint 3 — Modul Sertifikat — Dibangun, menunggu kredensial Drive untuk verifikasi live (2026-07-27)

Modul Sertifikat lengkap end-to-end sudah dibangun: Template → Generate →
Google Drive → Sertifikat Saya. UI memakai komponen design system yang sama
persis dari sprint sebelumnya (`PageHeader`, `ContentCard`, `StatCard`,
`buttonVariants`, table style helpers) — tidak ada style baru.

### Keputusan teknis penting: konversi DOCX→PDF lewat Google Drive
Tidak ada LibreOffice di lingkungan pengembangan maupun target deploy
(Vercel, serverless — tidak bisa menjalankan binary LibreOffice). Setelah
dikonfirmasi ke pengguna, pendekatan yang dipakai:
1. Isi placeholder `{{...}}` di file DOCX template pakai
   [docxtemplater](https://docxtemplater.com/) + `pizzip` (murni JS, jalan di
   mana saja).
2. Upload DOCX hasil isi ke Google Drive **sebagai Google Docs**
   (`mimeType: application/vnd.google-apps.document`) — Drive otomatis
   mengonversi format.
3. Export Google Doc tsb sebagai PDF lewat `drive.files.export`.
4. Hapus Google Doc sementara tsb, lalu upload PDF final ke folder Drive
   tujuan.

Ini sekaligus memenuhi requirement integrasi Google Drive tanpa dependency
tambahan. Trade-off: akurasi render bergantung pada konverter Google Docs
(untuk layout DOCX yang sangat kompleks/presisi pixel, hasil bisa sedikit
berbeda dari render Word/LibreOffice asli).

### Skema database (tambahan minimal — 2 tabel baru + 3 kolom opsional)
- `SertifikatTemplate` — nama, jumlahHalaman (1/2), fileName, **fileData
  (Bytes, disimpan langsung di Postgres)** — dipilih daripada storage
  terpisah karena deploy target serverless (filesystem tidak persisten).
- `Sertifikat` — 1:1 dengan `Pendaftaran` (`pendaftaranId @unique`),
  `nomorSertifikat @unique`, `status` (`PENDING`/`GENERATED`/`FAILED`),
  `driveFileId`/`driveUrl`/`driveFolder`/`generatedAt`/`errorMessage`.
- Kolom baru opsional (tidak breaking, semua nullable): `Peserta.gelar`,
  `Kegiatan.narasumber`, `Kegiatan.jabatanNarasumber` — dibutuhkan agar
  placeholder `{{gelar}}`, `{{narasumber}}`, `{{jabatan}}` di template
  punya sumber data. Ditambahkan juga ke form CRUD Peserta/Kegiatan, Import
  Excel (kolom "Gelar", opsional), dan Profil peserta (self-edit).
- Migration: `prisma/migrations/<ts>_sertifikat_module` — sudah diterapkan
  ke Supabase (bukan cuma disiapkan).

### Nomor sertifikat
- Format dapat diatur lewat env var `SERTIFIKAT_NOMOR_FORMAT` (default
  `{seq}/EVENT-UM/{bulanRomawi}/{tahun}`) dan `SERTIFIKAT_NOMOR_PADDING`
  (default 3). Placeholder: `{seq}`, `{bulan}`, `{bulanRomawi}`, `{tahun}`.
- Sequence diambil dari `count()+1` saat pertama kali sertifikat sebuah
  pendaftaran dibuat, dengan retry-loop kecil melawan race condition, plus
  constraint unique di kolom `nomorSertifikat` sebagai jaring pengaman
  terakhir. Nomor **tidak berubah** saat regenerate (regenerate memakai
  ulang nomor yang sama, hanya mengulang proses render+upload).

### Generate & status
- Sertifikat hanya bisa digenerate untuk `Pendaftaran` berstatus `HADIR`
  atau `SERTIFIKAT_TERBIT` (sudah pernah generate — untuk regenerate).
  Status `TERDAFTAR` ditolak dengan pesan jelas.
- Saat generate **berhasil**: `Sertifikat.status` → `GENERATED` (plus
  `driveFileId`/`driveUrl`/`driveFolder`/`generatedAt`), dan
  `Pendaftaran.status` otomatis ikut menjadi `SERTIFIKAT_TERBIT` (memakai
  enum yang sudah ada dari Sprint 2 — tidak ada perubahan pada
  `StatusPendaftaran`).
- Saat **gagal** (mis. kredensial Drive belum diisi): `Sertifikat.status` →
  `FAILED` + `errorMessage` tersimpan, `Pendaftaran.status` **tidak**
  berubah (tetap `HADIR`) sehingga aman untuk di-retry lewat "Regenerate".
  Perilaku ini sudah diverifikasi langsung (lihat bagian Verifikasi).
- "Generate Massal" memproses seluruh peserta `HADIR` pada satu kegiatan
  (otomatis mencakup yang sebelumnya gagal, karena status tetap `HADIR`).

### Halaman baru
- Admin: `/admin/sertifikat/template` (kelola template),
  `/admin/sertifikat/generate` (pilih kegiatan+template, generate satu/
  massal), `/admin/sertifikat` (daftar semua sertifikat + regenerate).
- Peserta: `/dashboard/sertifikat` (real, menggantikan placeholder Sprint 2)
  — daftar sertifikat milik sendiri + tombol unduh.
- Unduh: `/api/sertifikat/[id]/download` — route handler yang mengambil PDF
  dari Google Drive lewat Service Account lalu stream ke browser (bukan
  link publik Drive), supaya peserta yang tidak punya akses Drive tetap
  bisa unduh, dan admin/peserta lain tidak bisa mengakses sertifikat orang
  lain (dicek kepemilikan via `pendaftaran.peserta.userId`).

### Env var baru (lihat `.env.example`)
`GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`,
`GOOGLE_DRIVE_FOLDER_ID`, `SERTIFIKAT_NOMOR_FORMAT` (opsional),
`SERTIFIKAT_NOMOR_PADDING` (opsional).

### ⚠️ Status verifikasi: pipeline lengkap tervalidasi, roundtrip Drive asli belum
Kredensial Google Service Account **belum diisi** di `.env` pada sesi ini
(pengguna menyatakan sudah punya kredensial dan akan mengisi sendiri, mirip
alur Supabase). Yang sudah diverifikasi nyata terhadap database Supabase
live:
- Migration diterapkan, tabel `SertifikatTemplate` & `Sertifikat` ada.
- Rendering DOCX (docxtemplater) diuji dengan file `.docx` asli buatan
  sendiri berisi seluruh 10 placeholder — semua placeholder terganti benar
  (diverifikasi dengan membaca ulang `word/document.xml` hasil render).
- Upload template lewat halaman admin (disimulasikan via insert DB langsung
  karena tool browser di sesi ini tidak bisa mengisi `<input type="file">`
  — keterbatasan yang sama seperti dicatat di Sprint 2).
- Alur Generate Massal dijalankan sungguhan lewat browser (dengan
  `window.confirm` di-override via console karena headless browser
  otomatis membatalkan dialog konfirmasi): nomor sertifikat ter-assign
  benar (`001/EVENT-UM/VII/2026`), status berubah `PENDING`→`FAILED` tepat
  saat panggilan Google Drive gagal karena env var kosong (pesan error
  jelas & tampil di UI), dan **status `Pendaftaran` tetap `HADIR`** (tidak
  ikut berubah saat generate gagal — perilaku yang benar).
- Halaman Daftar Sertifikat menampilkan stat card & baris gagal dengan
  benar. Data uji coba sudah dibersihkan setelah verifikasi (tidak
  tercampur dengan data seed).
- `npm run lint` bersih, `npm run build` sukses, seluruh 19 route (3 baru
  untuk sertifikat + 1 route handler download) muncul dengan benar.

### 🛑 Update: kredensial sudah diisi, tapi ketemu blocker nyata dari Google (2026-07-27, lanjutan)

Pengguna mengisi kredensial Service Account sungguhan
(`sim-even-drive-uploader@sim-event-503613.iam.gserviceaccount.com` +
private key + folder ID `1ITxKB47-z5-6-08rnB_FgxB23yMItnKR`). Setelah diisi
ke `.env`, roundtrip Drive dicoba langsung (bukan lewat browser — lewat
skrip Node yang memanggil fungsi `convertDocxToPdf`/`uploadPdfToDrive` yang
sama persis dengan yang dipakai server action). Hasilnya **gagal konsisten**
dengan error asli dari Google:

```
The user's Drive storage quota has been exceeded.
```

**Penyebab (dikonfirmasi, bukan dugaan):** Service Account Google **selalu
punya kuota penyimpanan pribadi 0 byte**. Ketika Service Account membuat
file baru — termasuk di dalam folder "My Drive" milik akun asli yang sudah
di-share ke Service Account dengan akses Editor — file baru itu tetap
dianggap dimiliki oleh Service Account (bukan pemilik folder), sehingga
langsung kena limit 0 byte tsb dan gagal. Ini sudah diuji ulang dengan
menambahkan `parents`/`supportsAllDrives: true` pada setiap panggilan
`files.create` (perbaikan defensif yang tetap dipertahankan di
[src/lib/google-drive.ts](src/lib/google-drive.ts)) — tetap gagal dengan
pesan yang sama, memastikan folder tujuan memang folder "My Drive" biasa,
bukan Shared Drive.

**Solusi yang tersedia (pilih salah satu, butuh keputusan pengguna):**
1. **Shared Drive** — jika organisasi punya Google Workspace (berbayar):
   buat Shared Drive, tambahkan Service Account sebagai member, pakai ID
   folder di dalam Shared Drive itu sebagai `GOOGLE_DRIVE_FOLDER_ID`.
   Penyimpanan Shared Drive milik organisasi, bukan akun individual, jadi
   tidak kena limit 0 byte Service Account. Kode di `google-drive.ts` sudah
   siap (sudah pakai `supportsAllDrives: true` di semua panggilan) — tinggal
   ganti folder ID.
2. **OAuth2 delegated user** (untuk akun Google personal/gratis, tidak ada
   Shared Drive) — ganti dari Service Account ke OAuth2 di mana pemilik
   Drive (manusia asli) memberi izin sekali via consent screen, lalu
   aplikasi menyimpan refresh token dan upload atas nama akun tsb. Ini
   perubahan arsitektur yang lebih besar (perlu halaman/route OAuth callback
   + penyimpanan refresh token) — belum diimplementasikan.
3. **Domain-wide delegation** (Google Workspace juga) — Service Account
   "meniru" (impersonate) user asli lewat admin console, tanpa perlu Shared
   Drive. Perlu akses Workspace admin.

Tanpa salah satu di atas, upload PDF ke Drive **tidak akan pernah berhasil**
dengan Service Account biasa — ini keterbatasan Google, bukan bug di kode
aplikasi. Fungsi generate sudah menangani kegagalan ini dengan baik (status
`FAILED` + pesan error, `Pendaftaran.status` tidak berubah, aman di-retry),
jadi begitu salah satu solusi di atas diterapkan, generate akan langsung
bisa dicoba ulang tanpa perlu perubahan kode lain (asalkan opsinya Shared
Drive/domain delegation; opsi OAuth2 butuh kerja tambahan).

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

> **Update Sprint 3:** Sertifikat & Google Drive di bawah ini **sudah
> dikerjakan** — lihat bagian "Sprint 3 — Modul Sertifikat" di atas. Dua
> baris ini dipertahankan sebagai catatan sejarah keputusan Sprint 2.

- ~~**Sertifikat** — generate/desain PDF sertifikat~~ **(selesai Sprint 3)**
- ~~**Google Drive** — penyimpanan/ekspor file ke Drive~~ **(selesai Sprint 3)**
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

- **Prioritas:** isi kredensial Google Service Account di `.env` (lihat
  bagian "⚠️ Status verifikasi" di Sprint 3) supaya generate sertifikat bisa
  diverifikasi live sampai ke Google Drive & unduh peserta.
- Set env var produksi (`DATABASE_URL` ke host *pooler*, bukan direct) +
  kredensial Google di platform hosting, lalu jalankan
  `npm run db:migrate:deploy` di sana juga.
- QR Code: check-in kehadiran otomatis (ubah `TERDAFTAR` → `HADIR`).
- Notifikasi email/WhatsApp: kirim password akun baru & link sertifikat
  otomatis setelah terbit.
- Workflow: otomasi lanjutan (mis. auto `HADIR` saat check-in QR, auto
  generate massal begitu kegiatan berstatus `SELESAI`).
- Pertimbangkan uji end-to-end otomatis (Playwright) untuk form upload file
  (`<input type="file">`), yang tidak bisa diuji lewat tool browser pada
  sesi-sesi sebelumnya (Import Excel, Upload Template Sertifikat).
