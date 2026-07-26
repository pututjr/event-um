import Link from "next/link";

import { createKegiatanAction } from "@/lib/actions/kegiatan";
import { KegiatanForm } from "@/components/kegiatan-form";

export default function KegiatanBaruPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Link
          href="/admin/kegiatan"
          className="text-sm text-slate-500 hover:text-slate-800"
        >
          ← Kembali ke daftar kegiatan
        </Link>
        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          Tambah Kegiatan
        </h2>
      </div>

      <KegiatanForm
        action={createKegiatanAction}
        submitLabel="Simpan Kegiatan"
        onSuccessMessage="Kegiatan berhasil ditambahkan."
      />
    </div>
  );
}
