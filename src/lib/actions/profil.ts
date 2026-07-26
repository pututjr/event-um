"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { assertRole } from "@/lib/guards";
import { profilSchema } from "@/lib/validation/profil";

export type ProfilFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};

export async function updateProfilAction(
  _prevState: ProfilFormState,
  formData: FormData
): Promise<ProfilFormState> {
  const session = await assertRole("PESERTA");

  const parsed = profilSchema.safeParse({
    namaLengkap: formData.get("namaLengkap"),
    gelar: formData.get("gelar"),
    noHp: formData.get("noHp"),
    instansi: formData.get("instansi"),
    unitProdi: formData.get("unitProdi"),
  });

  if (!parsed.success) {
    return {
      error: "Periksa kembali data yang diisi.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string
      >,
    };
  }

  const { namaLengkap, gelar, noHp, instansi, unitProdi } = parsed.data;

  await prisma.peserta.update({
    where: { userId: session.user.id },
    data: {
      namaLengkap,
      gelar: gelar || null,
      noHp: noHp || null,
      instansi: instansi || null,
      unitProdi: unitProdi || null,
    },
  });

  revalidatePath("/dashboard/profil");
  revalidatePath("/dashboard");

  return { success: true };
}

export type PasswordFormState = {
  error?: string;
  success?: boolean;
};

export async function changePasswordAction(
  _prevState: PasswordFormState,
  formData: FormData
): Promise<PasswordFormState> {
  const session = await assertRole("PESERTA");

  const currentPassword = formData.get("currentPassword");
  const newPassword = formData.get("newPassword");
  const confirmPassword = formData.get("confirmPassword");

  if (
    typeof currentPassword !== "string" ||
    typeof newPassword !== "string" ||
    typeof confirmPassword !== "string" ||
    !currentPassword ||
    !newPassword ||
    !confirmPassword
  ) {
    return { error: "Semua kolom wajib diisi." };
  }

  if (newPassword.length < 8) {
    return { error: "Password baru minimal 8 karakter." };
  }

  if (newPassword !== confirmPassword) {
    return { error: "Konfirmasi password baru tidak sama." };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user) {
    return { error: "Pengguna tidak ditemukan." };
  }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    return { error: "Password saat ini salah." };
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  return { success: true };
}
