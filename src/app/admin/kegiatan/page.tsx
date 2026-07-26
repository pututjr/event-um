import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { KegiatanStatusBadge } from "@/components/status-badge";
import { formatDateTime } from "@/lib/format";

export default async function AdminKegiatanPage() {
  const kegiatanList = await prisma.kegiatan.findMany({
    orderBy: { tanggalMulai: "desc" },
    include: { _count: { select: { pendaftaran: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Data Kegiatan
          </h2>
          <p className="text-sm text-slate-500">
            {kegiatanList.length} kegiatan
          </p>
        </div>
        <Link
          href="/admin/kegiatan/baru"
          className="w-fit rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          + Tambah Kegiatan
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Judul</th>
              <th className="px-4 py-3">Waktu Mulai</th>
              <th className="px-4 py-3">Lokasi</th>
              <th className="px-4 py-3">Peserta</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {kegiatanList.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  Belum ada data kegiatan.
                </td>
              </tr>
            )}
            {kegiatanList.map((kegiatan) => (
              <tr key={kegiatan.id}>
                <td className="px-4 py-3 font-medium text-slate-900">
                  {kegiatan.judul}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {formatDateTime(kegiatan.tanggalMulai)}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {kegiatan.lokasi || "-"}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {kegiatan._count.pendaftaran}
                  {kegiatan.kuota ? ` / ${kegiatan.kuota}` : ""}
                </td>
                <td className="px-4 py-3">
                  <KegiatanStatusBadge status={kegiatan.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/kegiatan/${kegiatan.id}`}
                    className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Kelola
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
