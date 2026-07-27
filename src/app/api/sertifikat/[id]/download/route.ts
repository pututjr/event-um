import { NextResponse } from "next/server";

import { getSession } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { downloadDriveFileBuffer } from "@/lib/google-drive";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;

  const sertifikat = await prisma.sertifikat.findUnique({
    where: { id },
    include: { pendaftaran: { include: { peserta: true, kegiatan: true } } },
  });

  if (!sertifikat || sertifikat.status !== "GENERATED" || !sertifikat.driveFileId) {
    return new NextResponse("Sertifikat tidak ditemukan", { status: 404 });
  }

  const isOwner = sertifikat.pendaftaran.peserta.userId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!isOwner && !isAdmin) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const buffer = await downloadDriveFileBuffer(sertifikat.driveFileId);
  const fileName = `Sertifikat-${sertifikat.nomorSertifikat.replace(/\//g, "-")}.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
