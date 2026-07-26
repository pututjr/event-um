"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { StatusPendaftaran } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { assertRole } from "@/lib/guards";
import { kegiatanSchema } from "@/lib/validation/kegiatan";

export type KegiatanFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};

function parseKegiatanForm(formData: FormData) {
  return kegiatanSchema.safeParse({
    judul: formData.get("judul"),
    deskripsi: formData.get("deskripsi"),
    lokasi: formData.get("lokasi"),
    narasumber: formData.get("narasumber"),
    jabatanNarasumber: formData.get("jabatanNarasumber"),
    tanggalMulai: formData.get("tanggalMulai"),
    tanggalSelesai: formData.get("tanggalSelesai"),
    kuota: formData.get("kuota"),
    status: formData.get("status"),
  });
}

export async function createKegiatanAction(
  _prevState: KegiatanFormState,
  formData: FormData
): Promise<KegiatanFormState> {
  await assertRole("ADMIN");

  const parsed = parseKegiatanForm(formData);
  if (!parsed.success) {
    return {
      error: "Periksa kembali data yang diisi.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string
      >,
    };
  }

  const {
    judul,
    deskripsi,
    lokasi,
    narasumber,
    jabatanNarasumber,
    tanggalMulai,
    tanggalSelesai,
    kuota,
    status,
  } = parsed.data;

  await prisma.kegiatan.create({
    data: {
      judul,
      deskripsi: deskripsi || null,
      lokasi: lokasi || null,
      narasumber: narasumber || null,
      jabatanNarasumber: jabatanNarasumber || null,
      tanggalMulai,
      tanggalSelesai,
      kuota,
      status,
    },
  });

  revalidatePath("/admin/kegiatan");
  revalidatePath("/dashboard/aktif");

  return { success: true };
}

export async function updateKegiatanAction(
  kegiatanId: string,
  _prevState: KegiatanFormState,
  formData: FormData
): Promise<KegiatanFormState> {
  await assertRole("ADMIN");

  const parsed = parseKegiatanForm(formData);
  if (!parsed.success) {
    return {
      error: "Periksa kembali data yang diisi.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string
      >,
    };
  }

  const {
    judul,
    deskripsi,
    lokasi,
    narasumber,
    jabatanNarasumber,
    tanggalMulai,
    tanggalSelesai,
    kuota,
    status,
  } = parsed.data;

  await prisma.kegiatan.update({
    where: { id: kegiatanId },
    data: {
      judul,
      deskripsi: deskripsi || null,
      lokasi: lokasi || null,
      narasumber: narasumber || null,
      jabatanNarasumber: jabatanNarasumber || null,
      tanggalMulai,
      tanggalSelesai,
      kuota,
      status,
    },
  });

  revalidatePath("/admin/kegiatan");
  revalidatePath(`/admin/kegiatan/${kegiatanId}`);
  revalidatePath("/dashboard/aktif");

  return { success: true };
}

export async function deleteKegiatanAction(kegiatanId: string) {
  await assertRole("ADMIN");

  await prisma.kegiatan.delete({ where: { id: kegiatanId } });

  revalidatePath("/admin/kegiatan");
  redirect("/admin/kegiatan");
}

export async function updatePendaftaranStatusAction(
  pendaftaranId: string,
  status: StatusPendaftaran
) {
  await assertRole("ADMIN");

  await prisma.pendaftaran.update({
    where: { id: pendaftaranId },
    data: {
      status,
      tanggalHadir:
        status === "HADIR" || status === "SERTIFIKAT_TERBIT"
          ? new Date()
          : null,
    },
  });

  revalidatePath("/admin/kegiatan");
  revalidatePath("/dashboard/riwayat");
}
