import { FileText, ExternalLink } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { RegenerateSertifikatButton } from "@/components/regenerate-sertifikat-button";
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
  PENDING: "Diproses",
  GENERATED: "Terbit",
  FAILED: "Gagal",
};

export default async function DaftarSertifikatPage() {
  const sertifikatList = await prisma.sertifikat.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      pendaftaran: { include: { peserta: true, kegiatan: true } },
    },
  });

  const total = sertifikatList.length;
  const terbit = sertifikatList.filter((s) => s.status === "GENERATED").length;
  const gagal = sertifikatList.filter((s) => s.status === "FAILED").length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Daftar Sertifikat"
        subtitle="Seluruh sertifikat yang pernah digenerate"
        icon={<FileText className="h-5 w-5" />}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Sertifikat" value={total} icon={<FileText className="h-6 w-6" />} color="blue" />
        <StatCard label="Berhasil Terbit" value={terbit} icon={<FileText className="h-6 w-6" />} color="green" />
        <StatCard label="Gagal" value={gagal} icon={<FileText className="h-6 w-6" />} color="pink" />
      </div>

      <div className={tableWrapperClass}>
        <table className={tableClass}>
          <thead className={theadClass}>
            <tr>
              <th className={thClass}>Nomor</th>
              <th className={thClass}>Peserta</th>
              <th className={thClass}>Kegiatan</th>
              <th className={thClass}>Status</th>
              <th className={thClass}>Diterbitkan</th>
              <th className={`${thClass} text-right`}>Aksi</th>
            </tr>
          </thead>
          <tbody className={tbodyClass}>
            {sertifikatList.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                  Belum ada sertifikat yang digenerate.
                </td>
              </tr>
            )}
            {sertifikatList.map((s) => (
              <tr key={s.id} className={trClass}>
                <td className={`${tdClass} font-medium text-slate-900`}>
                  {s.nomorSertifikat}
                </td>
                <td className={`${tdClass} text-slate-600`}>
                  {s.pendaftaran.peserta.namaLengkap}
                </td>
                <td className={`${tdClass} text-slate-600`}>
                  {s.pendaftaran.kegiatan.judul}
                </td>
                <td className={tdClass}>
                  <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyle[s.status]}`}>
                    {statusLabel[s.status]}
                  </span>
                  {s.status === "FAILED" && s.errorMessage && (
                    <p className="mt-1 max-w-xs text-xs text-red-600">{s.errorMessage}</p>
                  )}
                </td>
                <td className={`${tdClass} text-slate-600`}>
                  {s.generatedAt ? formatDateTime(s.generatedAt) : "-"}
                  {s.driveUrl && (
                    <a
                      href={s.driveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 flex items-center gap-1 text-xs font-medium text-navy hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Lihat di Drive
                    </a>
                  )}
                </td>
                <td className={tdClass}>
                  <div className="flex justify-end">
                    <RegenerateSertifikatButton
                      pendaftaranId={s.pendaftaranId}
                      templateId={s.templateId}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
