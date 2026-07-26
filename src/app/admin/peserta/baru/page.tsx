import Link from "next/link";

import { createPesertaAction } from "@/lib/actions/peserta";
import { PesertaForm } from "@/components/peserta-form";

export default function PesertaBaruPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Link
          href="/admin/peserta"
          className="text-sm text-slate-500 hover:text-slate-800"
        >
          ← Kembali ke daftar peserta
        </Link>
        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          Tambah Peserta
        </h2>
        <p className="text-sm text-slate-500">
          Akun login peserta akan dibuat otomatis dengan password sementara.
        </p>
      </div>

      <PesertaForm action={createPesertaAction} submitLabel="Simpan Peserta" />
    </div>
  );
}
