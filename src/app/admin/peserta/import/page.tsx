import Link from "next/link";

import { ImportPesertaForm } from "@/components/import-peserta-form";

export default function ImportPesertaPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/peserta"
          className="text-sm text-slate-500 hover:text-slate-800"
        >
          ← Kembali ke daftar peserta
        </Link>
        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          Import Peserta dari Excel
        </h2>
        <p className="max-w-xl text-sm text-slate-500">
          Unggah file .xlsx dengan kolom: <strong>Nama Lengkap</strong>,{" "}
          <strong>Email</strong>, No HP, Instansi, Unit/Prodi, dan Jenis
          Peserta (MAHASISWA / DOSEN / TENDIK / UMUM). Baris dengan email yang
          sudah terdaftar atau data tidak lengkap akan dilewati.
        </p>
        <Link
          href="/admin/peserta/import/template"
          prefetch={false}
          className="mt-2 inline-block text-sm font-medium text-slate-700 underline hover:text-slate-900"
        >
          Unduh template Excel
        </Link>
      </div>

      <ImportPesertaForm />
    </div>
  );
}
