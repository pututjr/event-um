"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { assertRole } from "@/lib/guards";
import { generateTempPassword } from "@/lib/password";
import { pesertaSchema } from "@/lib/validation/peserta";
import { createAdminClient } from "@/lib/supabase/admin";

export type PesertaFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
  generatedPassword?: string;
};

function parsePesertaForm(formData: FormData) {
  return pesertaSchema.safeParse({
    namaLengkap: formData.get("namaLengkap"),
    email: formData.get("email"),
    gelar: formData.get("gelar"),
    noHp: formData.get("noHp"),
    instansi: formData.get("instansi"),
    unitProdi: formData.get("unitProdi"),
    jenisPeserta: formData.get("jenisPeserta"),
  });
}

export async function createPesertaAction(
  _prevState: PesertaFormState,
  formData: FormData
): Promise<PesertaFormState> {
  await assertRole("ADMIN");

  const parsed = parsePesertaForm(formData);
  if (!parsed.success) {
    return {
      error: "Periksa kembali data yang diisi.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string
      >,
    };
  }

  const { email, namaLengkap, gelar, noHp, instansi, unitProdi, jenisPeserta } =
    parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return {
      error: "Email sudah terdaftar sebagai pengguna.",
      fieldErrors: { email: "Email sudah digunakan" },
    };
  }

  const tempPassword = generateTempPassword();
  const supabase = createAdminClient();

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
  });

  if (error || !data.user) {
    return {
      error: `Gagal membuat akun peserta: ${error?.message ?? "unknown error"}`,
      fieldErrors: { email: "Email sudah digunakan" },
    };
  }

  try {
    await prisma.user.create({
      data: {
        id: data.user.id,
        email,
        role: "PESERTA",
        peserta: {
          create: {
            namaLengkap,
            gelar: gelar || null,
            noHp: noHp || null,
            instansi: instansi || null,
            unitProdi: unitProdi || null,
            jenisPeserta,
          },
        },
      },
    });
  } catch (e) {
    await supabase.auth.admin.deleteUser(data.user.id).catch(() => {});
    throw e;
  }

  revalidatePath("/admin/peserta");

  return { success: true, generatedPassword: tempPassword };
}

export async function updatePesertaAction(
  pesertaId: string,
  _prevState: PesertaFormState,
  formData: FormData
): Promise<PesertaFormState> {
  await assertRole("ADMIN");

  const parsed = parsePesertaForm(formData);
  if (!parsed.success) {
    return {
      error: "Periksa kembali data yang diisi.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string
      >,
    };
  }

  const { email, namaLengkap, gelar, noHp, instansi, unitProdi, jenisPeserta } =
    parsed.data;

  const peserta = await prisma.peserta.findUnique({
    where: { id: pesertaId },
    include: { user: true },
  });
  if (!peserta) {
    return { error: "Peserta tidak ditemukan." };
  }

  if (email !== peserta.user.email) {
    const supabase = createAdminClient();
    const { error } = await supabase.auth.admin.updateUserById(
      peserta.userId,
      { email }
    );
    if (error) {
      return {
        error: "Email sudah digunakan oleh pengguna lain.",
        fieldErrors: { email: "Email sudah digunakan" },
      };
    }
  }

  try {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: peserta.userId },
        data: { email },
      }),
      prisma.peserta.update({
        where: { id: pesertaId },
        data: {
          namaLengkap,
          gelar: gelar || null,
          noHp: noHp || null,
          instansi: instansi || null,
          unitProdi: unitProdi || null,
          jenisPeserta,
        },
      }),
    ]);
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return {
        error: "Email sudah digunakan oleh pengguna lain.",
        fieldErrors: { email: "Email sudah digunakan" },
      };
    }
    throw e;
  }

  revalidatePath("/admin/peserta");
  revalidatePath(`/admin/peserta/${pesertaId}`);

  return { success: true };
}

export async function resetPasswordAction(
  pesertaId: string
): Promise<{ password: string }> {
  await assertRole("ADMIN");

  const peserta = await prisma.peserta.findUnique({
    where: { id: pesertaId },
  });
  if (!peserta) {
    throw new Error("Peserta tidak ditemukan.");
  }

  const tempPassword = generateTempPassword();
  const supabase = createAdminClient();
  const { error } = await supabase.auth.admin.updateUserById(peserta.userId, {
    password: tempPassword,
  });
  if (error) {
    throw new Error(`Gagal reset password: ${error.message}`);
  }

  return { password: tempPassword };
}

export async function deletePesertaAction(pesertaId: string) {
  await assertRole("ADMIN");

  const peserta = await prisma.peserta.findUnique({
    where: { id: pesertaId },
  });
  if (!peserta) {
    redirect("/admin/peserta");
  }

  const supabase = createAdminClient();
  await supabase.auth.admin.deleteUser(peserta.userId).catch(() => {
    // If the auth user is already gone, still clean up our own row below.
  });
  await prisma.user.delete({ where: { id: peserta.userId } });

  revalidatePath("/admin/peserta");
  redirect("/admin/peserta");
}
