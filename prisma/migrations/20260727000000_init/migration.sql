-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'PESERTA');

-- CreateEnum
CREATE TYPE "JenisPeserta" AS ENUM ('MAHASISWA', 'DOSEN', 'TENDIK', 'UMUM');

-- CreateEnum
CREATE TYPE "StatusKegiatan" AS ENUM ('AKTIF', 'SELESAI', 'DIBATALKAN');

-- CreateEnum
CREATE TYPE "StatusPendaftaran" AS ENUM ('TERDAFTAR', 'HADIR', 'SERTIFIKAT_TERBIT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'PESERTA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Peserta" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "namaLengkap" TEXT NOT NULL,
    "noHp" TEXT,
    "instansi" TEXT,
    "unitProdi" TEXT,
    "jenisPeserta" "JenisPeserta" NOT NULL DEFAULT 'UMUM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Peserta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kegiatan" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT,
    "lokasi" TEXT,
    "tanggalMulai" TIMESTAMP(3) NOT NULL,
    "tanggalSelesai" TIMESTAMP(3) NOT NULL,
    "kuota" INTEGER,
    "status" "StatusKegiatan" NOT NULL DEFAULT 'AKTIF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kegiatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pendaftaran" (
    "id" TEXT NOT NULL,
    "pesertaId" TEXT NOT NULL,
    "kegiatanId" TEXT NOT NULL,
    "status" "StatusPendaftaran" NOT NULL DEFAULT 'TERDAFTAR',
    "tanggalDaftar" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tanggalHadir" TIMESTAMP(3),
    "catatan" TEXT,

    CONSTRAINT "Pendaftaran_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Peserta_userId_key" ON "Peserta"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Pendaftaran_pesertaId_kegiatanId_key" ON "Pendaftaran"("pesertaId", "kegiatanId");

-- AddForeignKey
ALTER TABLE "Peserta" ADD CONSTRAINT "Peserta_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pendaftaran" ADD CONSTRAINT "Pendaftaran_pesertaId_fkey" FOREIGN KEY ("pesertaId") REFERENCES "Peserta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pendaftaran" ADD CONSTRAINT "Pendaftaran_kegiatanId_fkey" FOREIGN KEY ("kegiatanId") REFERENCES "Kegiatan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

