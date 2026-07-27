"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { assertRole } from "@/lib/guards";
import { profilSchema } from "@/lib/validation/profil";
import { createClient } from "@/lib/supabase/server";

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

  const supabase = await createClient();

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: session.user.email,
    password: currentPassword,
  });
  if (verifyError) {
    return { error: "Password saat ini salah." };
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (updateError) {
    return { error: "Gagal memperbarui password. Coba lagi." };
  }

  return { success: true };
}
