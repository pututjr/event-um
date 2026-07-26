import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { getCurrentPeserta } from "@/lib/current-peserta";

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
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Halo, {peserta.namaLengkap}
        </h2>
        <p className="text-sm text-slate-500">
          Ringkasan aktivitas kegiatan Anda di EVENT UM.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Terdaftar" value={terdaftar} />
        <StatCard label="Hadir" value={hadir} />
        <StatCard label="Sertifikat Terbit" value={sertifikatTerbit} />
        <StatCard label="Kegiatan Aktif Tersedia" value={kegiatanAktifCount} />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/dashboard/aktif"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Lihat Kegiatan Aktif
        </Link>
        <Link
          href="/dashboard/riwayat"
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Lihat Riwayat Kegiatan
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-2xl font-semibold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}
