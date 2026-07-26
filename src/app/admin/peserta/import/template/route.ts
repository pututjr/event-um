import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet([
    ["Nama Lengkap", "Email", "No HP", "Instansi", "Unit/Prodi", "Jenis Peserta"],
    [
      "Contoh Nama Peserta",
      "contoh.peserta@email.com",
      "081234567890",
      "Universitas Negeri Malang",
      "Fakultas Teknik",
      "MAHASISWA",
    ],
  ]);
  XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

  const buffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  }) as Buffer;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition":
        'attachment; filename="template-import-peserta.xlsx"',
    },
  });
}
