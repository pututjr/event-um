-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'PESERTA',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Peserta" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "namaLengkap" TEXT NOT NULL,
    "noHp" TEXT,
    "instansi" TEXT,
    "unitProdi" TEXT,
    "jenisPeserta" TEXT NOT NULL DEFAULT 'UMUM',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Peserta_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Kegiatan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT,
    "lokasi" TEXT,
    "tanggalMulai" DATETIME NOT NULL,
    "tanggalSelesai" DATETIME NOT NULL,
    "kuota" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'AKTIF',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Pendaftaran" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pesertaId" TEXT NOT NULL,
    "kegiatanId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'TERDAFTAR',
    "tanggalDaftar" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tanggalHadir" DATETIME,
    "catatan" TEXT,
    CONSTRAINT "Pendaftaran_pesertaId_fkey" FOREIGN KEY ("pesertaId") REFERENCES "Peserta" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Pendaftaran_kegiatanId_fkey" FOREIGN KEY ("kegiatanId") REFERENCES "Kegiatan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Peserta_userId_key" ON "Peserta"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Pendaftaran_pesertaId_kegiatanId_key" ON "Pendaftaran"("pesertaId", "kegiatanId");
