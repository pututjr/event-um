import { z } from "zod";

export const profilSchema = z.object({
  namaLengkap: z.string().trim().min(3, "Nama lengkap minimal 3 karakter"),
  gelar: z.string().trim().optional().or(z.literal("")),
  noHp: z.string().trim().optional().or(z.literal("")),
  instansi: z.string().trim().optional().or(z.literal("")),
  unitProdi: z.string().trim().optional().or(z.literal("")),
});
