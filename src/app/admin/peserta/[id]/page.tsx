import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { updatePesertaAction, deletePesertaAction } from "@/lib/actions/peserta";
import { PesertaForm } from "@/components/peserta-form";
import { ResetPasswordButton } from "@/components/reset-password-button";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { PendaftaranStatusBadge } from "@/components/status-badge";
import { formatDateTime } from "@/lib/format";

export default async function PesertaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const peserta = await prisma.peserta.findUnique({
    where: { id },
    include: {
      user: true,
      pendaftaran: {
        include: { kegiatan: true },
        orderBy: { tanggalDaftar: "desc" },
      },
    },
  });

  if (!peserta) {
    notFound();
  }

  const updateAction = updatePesertaAction.bind(null, peserta.id);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href="/admin/peserta"
          className="text-sm text-slate-500 hover:text-slate-800"
        >
          ← Kembali ke daftar peserta
        </Link>
        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          {peserta.namaLengkap}
        </h2>
        <p className="text-sm text-slate-500">{peserta.user.email}</p>
      </div>

      <section className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Ubah Data
        </h3>
        <PesertaForm
          action={updateAction}
          submitLabel="Simpan Perubahan"
          defaultValues={{
            namaLengkap: peserta.namaLengkap,
            email: peserta.user.email,
            noHp: peserta.noHp ?? "",
            instansi: peserta.instansi ?? "",
            unitProdi: peserta.unitProdi ?? "",
            jenisPeserta: peserta.jenisPeserta,
          }}
        />
      </section>

      <section className="flex flex-col gap-3 border-t border-slate-200 pt-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Akun & Keamanan
        </h3>
        <ResetPasswordButton pesertaId={peserta.id} />
      </section>

      <section className="flex flex-col gap-3 border-t border-slate-200 pt-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Riwayat Kegiatan
        </h3>
        {peserta.pendaftaran.length === 0 ? (
          <p className="text-sm text-slate-500">
            Peserta ini belum pernah mendaftar kegiatan.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Kegiatan</th>
                  <th className="px-4 py-3">Tanggal Daftar</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {peserta.pendaftaran.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {p.kegiatan.judul}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatDateTime(p.tanggalDaftar)}
                    </td>
                    <td className="px-4 py-3">
                      <PendaftaranStatusBadge status={p.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="border-t border-slate-200 pt-6">
        <form action={deletePesertaAction.bind(null, peserta.id)}>
          <ConfirmSubmitButton
            confirmText={`Hapus peserta "${peserta.namaLengkap}"? Data pendaftaran terkait akan ikut terhapus.`}
            className="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
          >
            Hapus Peserta
          </ConfirmSubmitButton>
        </form>
      </section>
    </div>
  );
}
