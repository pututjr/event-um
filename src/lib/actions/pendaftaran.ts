"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { assertRole } from "@/lib/guards";

export async function daftarKegiatanAction(kegiatanId: string) {
  const session = await assertRole("PESERTA");

  const peserta = await prisma.peserta.findUnique({
    where: { userId: session.user.id },
  });
  if (!peserta) {
    throw new Error("Profil peserta tidak ditemukan.");
  }

  const kegiatan = await prisma.kegiatan.findUnique({
    where: { id: kegiatanId },
    include: { _count: { select: { pendaftaran: true } } },
  });
  if (!kegiatan || kegiatan.status !== "AKTIF") {
    throw new Error("Kegiatan tidak tersedia untuk pendaftaran.");
  }
  if (kegiatan.kuota != null && kegiatan._count.pendaftaran >= kegiatan.kuota) {
    throw new Error("Kuota kegiatan sudah penuh.");
  }

  await prisma.pendaftaran.upsert({
    where: {
      pesertaId_kegiatanId: { pesertaId: peserta.id, kegiatanId },
    },
    update: {},
    create: { pesertaId: peserta.id, kegiatanId },
  });

  revalidatePath("/dashboard/aktif");
  revalidatePath("/dashboard/riwayat");
  revalidatePath("/dashboard");
}
