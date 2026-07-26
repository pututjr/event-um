import { ClipboardList, CheckCircle2, Award, CalendarDays } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getCurrentPeserta } from "@/lib/current-peserta";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { LinkButton } from "@/components/ui/link-button";

export default async function DashboardPage() {
  const peserta = await getCurrentPeserta();

  const [terdaftar, hadir, sertifikatTerbit, kegiatanAktifCount] =
    await Promise.all([
      prisma.pendaftaran.count({
        where: { pesertaId: peserta.id, status: "TERDAFTAR" },
      }),
      prisma.pendaftaran.count({
        where: { pesertaId: peserta.id, status: "HADIR" },
      }),
      prisma.pendaftaran.count({
        where: { pesertaId: peserta.id, status: "SERTIFIKAT_TERBIT" },
      }),
      prisma.kegiatan.count({ where: { status: "AKTIF" } }),
    ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Halo, ${peserta.namaLengkap}`}
        subtitle="Ringkasan aktivitas kegiatan Anda di EVENT UM."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Terdaftar"
          value={terdaftar}
          icon={<ClipboardList className="h-6 w-6" />}
          color="blue"
        />
        <StatCard
          label="Hadir"
          value={hadir}
          icon={<CheckCircle2 className="h-6 w-6" />}
          color="purple"
        />
        <StatCard
          label="Sertifikat Terbit"
          value={sertifikatTerbit}
          icon={<Award className="h-6 w-6" />}
          color="green"
        />
        <StatCard
          label="Kegiatan Aktif Tersedia"
          value={kegiatanAktifCount}
          icon={<CalendarDays className="h-6 w-6" />}
          color="pink"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <LinkButton href="/dashboard/aktif">
          <CalendarDays className="h-4 w-4" />
          Lihat Kegiatan Aktif
        </LinkButton>
        <LinkButton href="/dashboard/riwayat" variant="secondary">
          <ClipboardList className="h-4 w-4" />
          Lihat Riwayat Kegiatan
        </LinkButton>
      </div>
    </div>
  );
}
