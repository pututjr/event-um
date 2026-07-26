import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { updateKegiatanAction, deleteKegiatanAction } from "@/lib/actions/kegiatan";
import { KegiatanForm } from "@/components/kegiatan-form";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { PendaftaranStatusSelect } from "@/components/pendaftaran-status-select";
import { formatDateTime, toDatetimeLocalValue } from "@/lib/format";

export default async function KegiatanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const kegiatan = await prisma.kegiatan.findUnique({
    where: { id },
    include: {
      pendaftaran: {
        include: { peserta: { include: { user: true } } },
        orderBy: { tanggalDaftar: "asc" },
      },
    },
  });

  if (!kegiatan) {
    notFound();
  }

  const updateAction = updateKegiatanAction.bind(null, kegiatan.id);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href="/admin/kegiatan"
          className="text-sm text-slate-500 hover:text-slate-800"
        >
          ← Kembali ke daftar kegiatan
        </Link>
        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          {kegiatan.judul}
        </h2>
      </div>

      <section className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Ubah Data Kegiatan
        </h3>
        <KegiatanForm
          action={updateAction}
          submitLabel="Simpan Perubahan"
          onSuccessMessage="Perubahan kegiatan tersimpan."
          defaultValues={{
            judul: kegiatan.judul,
            deskripsi: kegiatan.deskripsi ?? "",
            lokasi: kegiatan.lokasi ?? "",
            tanggalMulai: toDatetimeLocalValue(kegiatan.tanggalMulai),
            tanggalSelesai: toDatetimeLocalValue(kegiatan.tanggalSelesai),
            kuota: kegiatan.kuota != null ? String(kegiatan.kuota) : "",
            status: kegiatan.status,
          }}
        />
      </section>

      <section className="flex flex-col gap-3 border-t border-slate-200 pt-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Peserta Terdaftar ({kegiatan.pendaftaran.length})
        </h3>
        {kegiatan.pendaftaran.length === 0 ? (
          <p className="text-sm text-slate-500">
            Belum ada peserta yang mendaftar kegiatan ini.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Nama</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Tanggal Daftar</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {kegiatan.pendaftaran.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {p.peserta.namaLengkap}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {p.peserta.user.email}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatDateTime(p.tanggalDaftar)}
                    </td>
                    <td className="px-4 py-3">
                      <PendaftaranStatusSelect
                        pendaftaranId={p.id}
                        status={p.status}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="border-t border-slate-200 pt-6">
        <form action={deleteKegiatanAction.bind(null, kegiatan.id)}>
          <ConfirmSubmitButton
            confirmText={`Hapus kegiatan "${kegiatan.judul}"? Seluruh data pendaftaran terkait akan ikut terhapus.`}
            className="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
          >
            Hapus Kegiatan
          </ConfirmSubmitButton>
        </form>
      </section>
    </div>
  );
}
