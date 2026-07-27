"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { assertRole } from "@/lib/guards";
import { templateSchema } from "@/lib/validation/sertifikat";
import { formatNomorSertifikat } from "@/lib/sertifikat/nomor";
import { renderSertifikatDocx, type SertifikatData } from "@/lib/sertifikat/render-docx";
import { formatDate } from "@/lib/format";
import {
  convertDocxToPdf,
  uploadPdfToDrive,
  getDefaultDriveFolderId,
} from "@/lib/google-drive";

export type TemplateFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};

export async function uploadTemplateAction(
  _prevState: TemplateFormState,
  formData: FormData
): Promise<TemplateFormState> {
  await assertRole("ADMIN");

  const parsed = templateSchema.safeParse({
    nama: formData.get("nama"),
    jumlahHalaman: formData.get("jumlahHalaman"),
  });

  if (!parsed.success) {
    return {
      error: "Periksa kembali data yang diisi.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string>,
    };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Pilih file template (.docx) terlebih dahulu." };
  }
  if (!file.name.toLowerCase().endsWith(".docx")) {
    return { error: "File harus berformat .docx." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  await prisma.sertifikatTemplate.create({
    data: {
      nama: parsed.data.nama,
      jumlahHalaman: parsed.data.jumlahHalaman,
      fileName: file.name,
      fileData: buffer,
    },
  });

  revalidatePath("/admin/sertifikat/template");

  return { success: true };
}

export async function deleteTemplateAction(templateId: string) {
  await assertRole("ADMIN");

  await prisma.sertifikatTemplate.delete({ where: { id: templateId } });

  revalidatePath("/admin/sertifikat/template");
  redirect("/admin/sertifikat/template");
}

type GenerateOutcome = { ok: boolean; message: string };

async function performGenerate(
  pendaftaranId: string,
  templateId: string
): Promise<GenerateOutcome> {
  const pendaftaran = await prisma.pendaftaran.findUnique({
    where: { id: pendaftaranId },
    include: {
      peserta: true,
      kegiatan: true,
      sertifikat: true,
    },
  });

  if (!pendaftaran) {
    return { ok: false, message: "Pendaftaran tidak ditemukan." };
  }

  if (pendaftaran.status === "TERDAFTAR") {
    return {
      ok: false,
      message: `${pendaftaran.peserta.namaLengkap}: belum berstatus Hadir, tidak bisa digenerate.`,
    };
  }

  const template = await prisma.sertifikatTemplate.findUnique({
    where: { id: templateId },
  });
  if (!template) {
    return { ok: false, message: "Template sertifikat tidak ditemukan." };
  }

  let nomor = pendaftaran.sertifikat?.nomorSertifikat ?? null;

  if (!nomor) {
    for (let attempt = 0; attempt < 5; attempt++) {
      const count = await prisma.sertifikat.count();
      const candidate = formatNomorSertifikat(count + 1 + attempt);
      const clash = await prisma.sertifikat.findUnique({
        where: { nomorSertifikat: candidate },
      });
      if (!clash) {
        nomor = candidate;
        break;
      }
    }
  }

  if (!nomor) {
    return {
      ok: false,
      message: `${pendaftaran.peserta.namaLengkap}: gagal membuat nomor sertifikat unik.`,
    };
  }

  const sertifikat = await prisma.sertifikat.upsert({
    where: { pendaftaranId },
    create: {
      pendaftaranId,
      templateId,
      nomorSertifikat: nomor,
      status: "PENDING",
    },
    update: {
      templateId,
      status: "PENDING",
      errorMessage: null,
    },
  });

  try {
    const data: SertifikatData = {
      nama: pendaftaran.peserta.namaLengkap,
      gelar: pendaftaran.peserta.gelar ?? "",
      instansi: pendaftaran.peserta.instansi ?? "",
      kegiatan: pendaftaran.kegiatan.judul,
      tanggal: formatDate(pendaftaran.kegiatan.tanggalMulai),
      lokasi: pendaftaran.kegiatan.lokasi ?? "",
      nomor_sertifikat: nomor,
      narasumber: pendaftaran.kegiatan.narasumber ?? "",
      jabatan: pendaftaran.kegiatan.jabatanNarasumber ?? "",
      unit: pendaftaran.peserta.unitProdi ?? "",
    };

    const filledDocx = renderSertifikatDocx(
      Buffer.from(template.fileData),
      data
    );
    const folderId = getDefaultDriveFolderId();
    const pdfBuffer = await convertDocxToPdf(
      filledDocx,
      `${nomor}.docx`,
      folderId
    );
    const uploaded = await uploadPdfToDrive(
      pdfBuffer,
      `Sertifikat - ${data.nama} - ${data.kegiatan}.pdf`,
      folderId
    );

    await prisma.$transaction([
      prisma.sertifikat.update({
        where: { id: sertifikat.id },
        data: {
          status: "GENERATED",
          driveFileId: uploaded.id,
          driveUrl: uploaded.webViewLink,
          driveFolder: folderId,
          generatedAt: new Date(),
          errorMessage: null,
        },
      }),
      prisma.pendaftaran.update({
        where: { id: pendaftaranId },
        data: { status: "SERTIFIKAT_TERBIT" },
      }),
    ]);

    return {
      ok: true,
      message: `${pendaftaran.peserta.namaLengkap}: berhasil digenerate.`,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Gagal generate sertifikat.";

    await prisma.sertifikat.update({
      where: { id: sertifikat.id },
      data: { status: "FAILED", errorMessage: message },
    });

    return { ok: false, message: `${pendaftaran.peserta.namaLengkap}: ${message}` };
  }
}

export async function generateSertifikatAction(
  pendaftaranId: string,
  templateId: string
): Promise<GenerateOutcome> {
  await assertRole("ADMIN");

  const result = await performGenerate(pendaftaranId, templateId);

  revalidatePath("/admin/sertifikat");
  revalidatePath("/admin/sertifikat/generate");
  revalidatePath("/dashboard/sertifikat");
  revalidatePath("/dashboard/riwayat");

  return result;
}

export type GenerateMassalState = {
  error?: string;
  summary?: {
    total: number;
    berhasil: number;
    gagal: string[];
  };
};

export async function generateMassalAction(
  kegiatanId: string,
  templateId: string
): Promise<GenerateMassalState> {
  await assertRole("ADMIN");

  const targets = await prisma.pendaftaran.findMany({
    where: { kegiatanId, status: "HADIR" },
    select: { id: true },
  });

  if (targets.length === 0) {
    return {
      error:
        "Tidak ada peserta berstatus Hadir yang belum memiliki sertifikat pada kegiatan ini.",
    };
  }

  const results: GenerateOutcome[] = [];
  for (const target of targets) {
    results.push(await performGenerate(target.id, templateId));
  }

  revalidatePath("/admin/sertifikat");
  revalidatePath("/admin/sertifikat/generate");
  revalidatePath("/dashboard/sertifikat");
  revalidatePath("/dashboard/riwayat");

  return {
    summary: {
      total: results.length,
      berhasil: results.filter((r) => r.ok).length,
      gagal: results.filter((r) => !r.ok).map((r) => r.message),
    },
  };
}

