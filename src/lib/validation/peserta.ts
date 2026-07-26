import { z } from "zod";

export const jenisPesertaValues = [
  "MAHASISWA",
  "DOSEN",
  "TENDIK",
  "UMUM",
] as const;

export const pesertaSchema = z.object({
  namaLengkap: z.string().trim().min(3, "Nama lengkap minimal 3 karakter"),
  email: z.string().trim().toLowerCase().email("Email tidak valid"),
  gelar: z.string().trim().optional().or(z.literal("")),
  noHp: z.string().trim().optional().or(z.literal("")),
  instansi: z.string().trim().optional().or(z.literal("")),
  unitProdi: z.string().trim().optional().or(z.literal("")),
  jenisPeserta: z.enum(jenisPesertaValues),
});

export type PesertaInput = z.infer<typeof pesertaSchema>;
