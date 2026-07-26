import { Award, Download } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getCurrentPeserta } from "@/lib/current-peserta";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { ContentCard } from "@/components/ui/content-card";
import { buttonVariants } from "@/components/ui/button";
import {
  tableWrapperClass,
  tableClass,
  theadClass,
  thClass,
  tbodyClass,
  trClass,
  tdClass,
} from "@/components/ui/styles";

const statusStyle: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  GENERATED: "bg-emerald-100 text-emerald-800",
  FAILED: "bg-red-100 text-red-800",
};

const statusLabel: Record<string, string> = {
  PENDING: "Sedang Diproses",
  GENERATED: "Siap Diunduh",
  FAILED: "Gagal, Hubungi Admin",
};

export default async function SertifikatSayaPage() {
  const peserta = await getCurrentPeserta();

  const pendaftaranList = await prisma.pendaftaran.findMany({
    where: { pesertaId: peserta.id, sertifikat: { isNot: null } },
    include: { kegiatan: true, sertifikat: true },
    orderBy: { tanggalDaftar: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Sertifikat Saya"
        subtitle="Unduh sertifikat dari kegiatan yang sudah Anda ikuti"
        icon={<Award className="h-5 w-5" />}
      />

      {pendaftaranList.length === 0 ? (
        <ContentCard>
          <p className="text-sm text-slate-500">
            Belum ada sertifikat yang tersedia. Sertifikat akan muncul di sini
            setelah admin menerbitkannya untuk kegiatan yang Anda ikuti.
          </p>
        </ContentCard>
      ) : (
        <div className={tableWrapperClass}>
          <table className={tableClass}>
            <thead className={theadClass}>
              <tr>
                <th className={thClass}>Kegiatan</th>
                <th className={thClass}>Tanggal</th>
                <th className={thClass}>Status</th>
                <th className={`${thClass} text-right`}>Unduh</th>
              </tr>
            </thead>
            <tbody className={tbodyClass}>
              {pendaftaranList.map((p) => (
                <tr key={p.id} className={trClass}>
                  <td className={`${tdClass} font-medium text-slate-900`}>
                    {p.kegiatan.judul}
                  </td>
                  <td className={`${tdClass} text-slate-600`}>
                    {formatDate(p.kegiatan.tanggalMulai)}
                  </td>
                  <td className={tdClass}>
                    <span
                      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyle[p.sertifikat!.status]}`}
                    >
                      {statusLabel[p.sertifikat!.status]}
                    </span>
                  </td>
                  <td className={`${tdClass} text-right`}>
                    {p.sertifikat!.status === "GENERATED" ? (
                      <a
                        href={`/api/sertifikat/${p.sertifikat!.id}/download`}
                        className={buttonVariants({ variant: "secondary", size: "sm" })}
                      >
                        <Download className="h-3.5 w-3.5" />
                        Unduh
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
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
