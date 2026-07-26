import { z } from "zod";

export const statusKegiatanValues = ["AKTIF", "SELESAI", "DIBATALKAN"] as const;

export const kegiatanSchema = z
  .object({
    judul: z.string().trim().min(3, "Judul minimal 3 karakter"),
    deskripsi: z.string().trim().optional().or(z.literal("")),
    lokasi: z.string().trim().optional().or(z.literal("")),
    narasumber: z.string().trim().optional().or(z.literal("")),
    jabatanNarasumber: z.string().trim().optional().or(z.literal("")),
    tanggalMulai: z.coerce.date({ message: "Tanggal mulai tidak valid" }),
    tanggalSelesai: z.coerce.date({ message: "Tanggal selesai tidak valid" }),
    kuota: z
      .string()
      .trim()
      .optional()
      .or(z.literal(""))
      .transform((v) => (v ? Number(v) : null)),
    status: z.enum(statusKegiatanValues),
  })
  .refine((data) => data.tanggalSelesai >= data.tanggalMulai, {
    message: "Tanggal selesai tidak boleh sebelum tanggal mulai",
    path: ["tanggalSelesai"],
  });

export type KegiatanInput = z.infer<typeof kegiatanSchema>;
