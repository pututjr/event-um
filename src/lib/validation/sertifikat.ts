import { z } from "zod";

export const templateSchema = z.object({
  nama: z.string().trim().min(3, "Nama template minimal 3 karakter"),
  jumlahHalaman: z.coerce.number().int().min(1).max(2),
});

export type TemplateInput = z.infer<typeof templateSchema>;
