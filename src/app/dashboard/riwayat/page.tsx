import { prisma } from "@/lib/prisma";
import { getCurrentPeserta } from "@/lib/current-peserta";
import { PendaftaranStatusBadge } from "@/components/status-badge";
import { formatDateTime } from "@/lib/format";

export default async function RiwayatKegiatanPage() {
  const peserta = await getCurrentPeserta();

  const pendaftaran = await prisma.pendaftaran.findMany({
    where: { pesertaId: peserta.id },
    include: { kegiatan: true },
    orderBy: { tanggalDaftar: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Riwayat Kegiatan
        </h2>
        <p className="text-sm text-slate-500">
          Daftar kegiatan yang pernah Anda ikuti beserta status terkini.
        </p>
      </div>

      {pendaftaran.length === 0 ? (
        <p className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500">
          Anda belum pernah mendaftar kegiatan apa pun. Lihat{" "}
          <span className="font-medium">Kegiatan Aktif</span> untuk mulai
          mendaftar.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Kegiatan</th>
                <th className="px-4 py-3">Tanggal Kegiatan</th>
                <th className="px-4 py-3">Tanggal Daftar</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pendaftaran.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {p.kegiatan.judul}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatDateTime(p.kegiatan.tanggalMulai)}
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
    </div>
  );
}
