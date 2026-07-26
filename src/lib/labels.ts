import type { JenisPeserta } from "@prisma/client";

export const jenisPesertaLabel: Record<JenisPeserta, string> = {
  MAHASISWA: "Mahasiswa",
  DOSEN: "Dosen",
  TENDIK: "Tenaga Kependidikan",
  UMUM: "Umum",
};
