import { google } from "googleapis";
import { Readable } from "stream";

const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const GOOGLE_DOC_MIME = "application/vnd.google-apps.document";
const PDF_MIME = "application/pdf";

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Konfigurasi Google Drive belum lengkap: environment variable ${name} belum diisi.`
    );
  }
  return value;
}

function getAuth() {
  const email = getEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  const privateKey = getEnv("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY").replace(
    /\\n/g,
    "\n"
  );

  return new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/drive"],
  });
}

function getDriveClient() {
  return google.drive({ version: "v3", auth: getAuth() });
}

export function getDefaultDriveFolderId(): string {
  return getEnv("GOOGLE_DRIVE_FOLDER_ID");
}

function bufferToStream(buffer: Buffer): Readable {
  return Readable.from(buffer);
}

/**
 * Convert a filled DOCX buffer to PDF bytes using Google Drive's own
 * conversion: upload as a Google Doc (auto-converts DOCX), export as PDF,
 * then delete the intermediate Google Doc. Avoids needing LibreOffice,
 * which isn't available in this serverless deployment target.
 */
export async function convertDocxToPdf(
  docxBuffer: Buffer,
  fileName: string,
  parentFolderId: string
): Promise<Buffer> {
  const drive = getDriveClient();

  // The temp Google Doc must be created inside a Shared Drive folder (via
  // `parents`), not the service account's own My Drive - service accounts
  // have 0 bytes of personal storage quota, so an unparented create (or one
  // parented to a regular My Drive folder) fails immediately.
  const created = await drive.files.create({
    requestBody: {
      name: `~tmp-${fileName}`,
      mimeType: GOOGLE_DOC_MIME,
      parents: [parentFolderId],
    },
    media: {
      mimeType: DOCX_MIME,
      body: bufferToStream(docxBuffer),
    },
    fields: "id",
    supportsAllDrives: true,
  });

  const tempFileId = created.data.id;
  if (!tempFileId) {
    throw new Error("Gagal membuat file konversi sementara di Google Drive.");
  }

  try {
    const exported = await drive.files.export(
      { fileId: tempFileId, mimeType: PDF_MIME },
      { responseType: "arraybuffer" }
    );
    return Buffer.from(exported.data as ArrayBuffer);
  } finally {
    await drive.files
      .delete({ fileId: tempFileId, supportsAllDrives: true })
      .catch(() => {
        // Best-effort cleanup; a leftover temp file is harmless.
      });
  }
}

export async function uploadFileToDrive(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
  folderId: string
): Promise<{ id: string; webViewLink: string }> {
  const drive = getDriveClient();

  const uploaded = await drive.files.create({
    requestBody: {
      name: fileName,
      mimeType,
      parents: [folderId],
    },
    media: {
      mimeType,
      body: bufferToStream(buffer),
    },
    fields: "id, webViewLink",
    supportsAllDrives: true,
  });

  const id = uploaded.data.id;
  if (!id) {
    throw new Error("Gagal mengunggah file ke Google Drive.");
  }

  return {
    id,
    webViewLink: uploaded.data.webViewLink ?? `https://drive.google.com/file/d/${id}/view`,
  };
}

export async function uploadPdfToDrive(
  pdfBuffer: Buffer,
  fileName: string,
  folderId: string
): Promise<{ id: string; webViewLink: string }> {
  return uploadFileToDrive(pdfBuffer, fileName, PDF_MIME, folderId);
}

export async function uploadDocxToDrive(
  docxBuffer: Buffer,
  fileName: string,
  folderId: string
): Promise<{ id: string; webViewLink: string }> {
  return uploadFileToDrive(docxBuffer, fileName, DOCX_MIME, folderId);
}

export async function downloadDriveFileBuffer(fileId: string): Promise<Buffer> {
  const drive = getDriveClient();
  const res = await drive.files.get(
    { fileId, alt: "media", supportsAllDrives: true },
    { responseType: "arraybuffer" }
  );
  return Buffer.from(res.data as ArrayBuffer);
}

export async function deleteDriveFile(fileId: string): Promise<void> {
  const drive = getDriveClient();
  await drive.files.delete({ fileId, supportsAllDrives: true });
}
