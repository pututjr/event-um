"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import * as XLSX from "xlsx";
import type { JenisPeserta } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { assertRole } from "@/lib/guards";
import { generateTempPassword } from "@/lib/password";

export type ImportSkipped = {
  row: number;
  email?: string;
  reason: string;
};

export type ImportState = {
  error?: string;
  success?: boolean;
  password?: string;
  summary?: {
    total: number;
    created: number;
    skipped: ImportSkipped[];
  };
};

function normalizeJenis(value: string): JenisPeserta {
  const v = value.trim().toUpperCase();
  if (v.startsWith("MAHASISWA")) return "MAHASISWA";
  if (v.startsWith("DOSEN")) return "DOSEN";
  if (v.startsWith("TENDIK")) return "TENDIK";
  return "UMUM";
}

function readCell(row: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return String(value).trim();
    }
  }
  return "";
}

export async function importPesertaAction(
  _prevState: ImportState,
  formData: FormData
): Promise<ImportState> {
  await assertRole("ADMIN");

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Pilih file Excel (.xlsx) terlebih dahulu." };
  }

  let rows: Record<string, unknown>[];
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: "",
    });
  } catch {
    return { error: "File tidak dapat dibaca. Pastikan formatnya .xlsx." };
  }

  if (rows.length === 0) {
    return { error: "File Excel tidak berisi data peserta." };
  }

  const tempPassword = generateTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  const skipped: ImportSkipped[] = [];
  const seenEmails = new Set<string>();
  let created = 0;

  for (let i = 0; i < rows.length; i++) {
    const rowNum = i + 2; // baris 1 = header
    const raw = rows[i];

    const namaLengkap = readCell(raw, "Nama Lengkap", "nama lengkap", "Nama");
    const email = readCell(raw, "Email", "email").toLowerCase();
    const gelar = readCell(raw, "Gelar", "gelar");
    const noHp = readCell(raw, "No HP", "no hp", "No. HP", "Telepon");
    const instansi = readCell(raw, "Instansi", "instansi");
    const unitProdi = readCell(
      raw,
      "Unit/Prodi",
      "unit/prodi",
      "Unit Prodi",
      "Prodi"
    );
    const jenisPeserta = normalizeJenis(
      readCell(raw, "Jenis Peserta", "jenis peserta")
    );

    if (!namaLengkap || !email) {
      skipped.push({ row: rowNum, email, reason: "Nama atau email kosong" });
      continue;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      skipped.push({ row: rowNum, email, reason: "Format email tidak valid" });
      continue;
    }
    if (seenEmails.has(email)) {
      skipped.push({ row: rowNum, email, reason: "Email duplikat dalam file" });
      continue;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      skipped.push({ row: rowNum, email, reason: "Email sudah terdaftar" });
      continue;
    }

    await prisma.user.create({
      data: {
        email,
        passwordHash,
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
    seenEmails.add(email);
    created++;
  }

  revalidatePath("/admin/peserta");

  return {
    success: true,
    password: created > 0 ? tempPassword : undefined,
    summary: { total: rows.length, created, skipped },
  };
}
