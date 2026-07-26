import { History } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getCurrentPeserta } from "@/lib/current-peserta";
import { PendaftaranStatusBadge } from "@/components/status-badge";
import { formatDateTime } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { ContentCard } from "@/components/ui/content-card";
import {
  tableWrapperClass,
  tableClass,
  theadClass,
  thClass,
  tbodyClass,
  trClass,
  tdClass,
} from "@/components/ui/styles";

export default async function RiwayatKegiatanPage() {
  const peserta = await getCurrentPeserta();

  const pendaftaran = await prisma.pendaftaran.findMany({
    where: { pesertaId: peserta.id },
    include: { kegiatan: true },
    orderBy: { tanggalDaftar: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Riwayat Kegiatan"
        subtitle="Daftar kegiatan yang pernah Anda ikuti beserta status terkini"
        icon={<History className="h-5 w-5" />}
      />

      {pendaftaran.length === 0 ? (
        <ContentCard>
          <p className="text-sm text-slate-500">
            Anda belum pernah mendaftar kegiatan apa pun. Lihat{" "}
            <span className="font-medium">Kegiatan Aktif</span> untuk mulai
            mendaftar.
          </p>
        </ContentCard>
      ) : (
        <div className={tableWrapperClass}>
          <table className={tableClass}>
            <thead className={theadClass}>
              <tr>
                <th className={thClass}>Kegiatan</th>
                <th className={thClass}>Tanggal Kegiatan</th>
                <th className={thClass}>Tanggal Daftar</th>
                <th className={thClass}>Status</th>
              </tr>
            </thead>
            <tbody className={tbodyClass}>
              {pendaftaran.map((p) => (
                <tr key={p.id} className={trClass}>
                  <td className={`${tdClass} font-medium text-slate-900`}>
                    {p.kegiatan.judul}
                  </td>
                  <td className={`${tdClass} text-slate-600`}>
                    {formatDateTime(p.kegiatan.tanggalMulai)}
                  </td>
                  <td className={`${tdClass} text-slate-600`}>
                    {formatDateTime(p.tanggalDaftar)}
                  </td>
                  <td className={tdClass}>
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
