import Link from "next/link";
import { CalendarDays, Plus } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { KegiatanStatusBadge } from "@/components/status-badge";
import { formatDateTime } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { LinkButton } from "@/components/ui/link-button";
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

export default async function AdminKegiatanPage() {
  const kegiatanList = await prisma.kegiatan.findMany({
    orderBy: { tanggalMulai: "desc" },
    include: { _count: { select: { pendaftaran: true } } },
  });

  const totalAktif = kegiatanList.filter((k) => k.status === "AKTIF").length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Data Kegiatan"
        subtitle="Kelola kegiatan dan peserta yang terdaftar"
        icon={<CalendarDays className="h-5 w-5" />}
        actions={
          <LinkButton href="/admin/kegiatan/baru">
            <Plus className="h-4 w-4" />
            Tambah Kegiatan
          </LinkButton>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          label="Total Kegiatan"
          value={kegiatanList.length}
          icon={<CalendarDays className="h-6 w-6" />}
          color="blue"
        />
        <StatCard
          label="Kegiatan Aktif"
          value={totalAktif}
          icon={<CalendarDays className="h-6 w-6" />}
          color="green"
        />
      </div>

      <div className={tableWrapperClass}>
        <table className={tableClass}>
          <thead className={theadClass}>
            <tr>
              <th className={thClass}>Judul</th>
              <th className={thClass}>Waktu Mulai</th>
              <th className={thClass}>Lokasi</th>
              <th className={thClass}>Peserta</th>
              <th className={thClass}>Status</th>
              <th className={`${thClass} text-right`}>Aksi</th>
            </tr>
          </thead>
          <tbody className={tbodyClass}>
            {kegiatanList.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                  Belum ada data kegiatan.
                </td>
              </tr>
            )}
            {kegiatanList.map((kegiatan) => (
              <tr key={kegiatan.id} className={trClass}>
                <td className={`${tdClass} font-medium text-slate-900`}>
                  {kegiatan.judul}
                </td>
                <td className={`${tdClass} text-slate-600`}>
                  {formatDateTime(kegiatan.tanggalMulai)}
                </td>
                <td className={`${tdClass} text-slate-600`}>
                  {kegiatan.lokasi || "-"}
                </td>
                <td className={`${tdClass} text-slate-600`}>
                  {kegiatan._count.pendaftaran}
                  {kegiatan.kuota ? ` / ${kegiatan.kuota}` : ""}
                </td>
                <td className={tdClass}>
                  <KegiatanStatusBadge status={kegiatan.status} />
                </td>
                <td className={`${tdClass} text-right`}>
                  <Link
                    href={`/admin/kegiatan/${kegiatan.id}`}
                    className={buttonVariants({ variant: "secondary", size: "sm" })}
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
