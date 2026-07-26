import Link from "next/link";
import { FileSpreadsheet, Download } from "lucide-react";

import { ImportPesertaForm } from "@/components/import-peserta-form";
import { PageHeader } from "@/components/ui/page-header";
import { ContentCard } from "@/components/ui/content-card";
import { BackLink } from "@/components/ui/back-link";

export default function ImportPesertaPage() {
  return (
    <div className="flex flex-col gap-6">
      <BackLink href="/admin/peserta">Kembali ke daftar peserta</BackLink>

      <PageHeader
        title="Import Peserta dari Excel"
        subtitle="Unggah file .xlsx untuk menambahkan banyak peserta sekaligus"
        icon={<FileSpreadsheet className="h-5 w-5" />}
      />

      <ContentCard className="flex flex-col gap-4">
        <p className="max-w-xl text-sm text-slate-600">
          Kolom yang dibutuhkan: <strong>Nama Lengkap</strong>,{" "}
          <strong>Email</strong>, Gelar (opsional), No HP, Instansi,
          Unit/Prodi, dan Jenis Peserta (MAHASISWA / DOSEN / TENDIK / UMUM).
          Baris dengan email yang sudah terdaftar atau data tidak lengkap akan
          dilewati.
        </p>
        <Link
          href="/admin/peserta/import/template"
          prefetch={false}
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-navy hover:underline"
        >
          <Download className="h-4 w-4" />
          Unduh template Excel
        </Link>

        <div className="border-t border-slate-200 pt-5">
          <ImportPesertaForm />
        </div>
      </ContentCard>
    </div>
  );
}
