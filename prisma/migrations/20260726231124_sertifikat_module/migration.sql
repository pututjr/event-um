-- CreateEnum
CREATE TYPE "StatusSertifikat" AS ENUM ('PENDING', 'GENERATED', 'FAILED');

-- AlterTable
ALTER TABLE "Kegiatan" ADD COLUMN     "jabatanNarasumber" TEXT,
ADD COLUMN     "narasumber" TEXT;

-- AlterTable
ALTER TABLE "Peserta" ADD COLUMN     "gelar" TEXT;

-- CreateTable
CREATE TABLE "SertifikatTemplate" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jumlahHalaman" INTEGER NOT NULL DEFAULT 1,
    "fileName" TEXT NOT NULL,
    "fileData" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SertifikatTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sertifikat" (
    "id" TEXT NOT NULL,
    "pendaftaranId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "nomorSertifikat" TEXT NOT NULL,
    "status" "StatusSertifikat" NOT NULL DEFAULT 'PENDING',
    "driveFileId" TEXT,
    "driveUrl" TEXT,
    "driveFolder" TEXT,
    "errorMessage" TEXT,
    "generatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sertifikat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Sertifikat_pendaftaranId_key" ON "Sertifikat"("pendaftaranId");

-- CreateIndex
CREATE UNIQUE INDEX "Sertifikat_nomorSertifikat_key" ON "Sertifikat"("nomorSertifikat");

-- AddForeignKey
ALTER TABLE "Sertifikat" ADD CONSTRAINT "Sertifikat_pendaftaranId_fkey" FOREIGN KEY ("pendaftaranId") REFERENCES "Pendaftaran"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sertifikat" ADD CONSTRAINT "Sertifikat_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "SertifikatTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
