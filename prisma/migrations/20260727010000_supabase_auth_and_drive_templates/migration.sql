-- AlterTable
ALTER TABLE "SertifikatTemplate" DROP COLUMN "fileData",
ADD COLUMN     "driveFileId" TEXT NOT NULL,
ADD COLUMN     "driveUrl" TEXT,
ADD COLUMN     "mimeType" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "passwordHash";

