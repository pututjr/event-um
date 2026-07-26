"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { assertRole } from "@/lib/guards";
import { generateTempPassword } from "@/lib/password";
import { pesertaSchema } from "@/lib/validation/peserta";

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

  const { email, namaLengkap, noHp, instansi, unitProdi, jenisPeserta } =
    parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return {
      error: "Email sudah terdaftar sebagai pengguna.",
      fieldErrors: { email: "Email sudah digunakan" },
    };
  }

  const tempPassword = generateTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: "PESERTA",
      peserta: {
        create: {
          namaLengkap,
          noHp: noHp || null,
          instansi: instansi || null,
          unitProdi: unitProdi || null,
          jenisPeserta,
        },
      },
    },
  });

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

  const { email, namaLengkap, noHp, instansi, unitProdi, jenisPeserta } =
    parsed.data;

  const peserta = await prisma.peserta.findUnique({
    where: { id: pesertaId },
    include: { user: true },
  });
  if (!peserta) {
    return { error: "Peserta tidak ditemukan." };
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
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  await prisma.user.update({
    where: { id: peserta.userId },
    data: { passwordHash },
  });

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

  await prisma.user.delete({ where: { id: peserta.userId } });

  revalidatePath("/admin/peserta");
  redirect("/admin/peserta");
}
