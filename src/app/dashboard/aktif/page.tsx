import { CalendarCheck2, MapPin, Users } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getCurrentPeserta } from "@/lib/current-peserta";
import { daftarKegiatanAction } from "@/lib/actions/pendaftaran";
import { formatDateTime } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { ContentCard } from "@/components/ui/content-card";
import { buttonVariants } from "@/components/ui/button";

export default async function KegiatanAktifPage() {
  const peserta = await getCurrentPeserta();

  const kegiatanAktif = await prisma.kegiatan.findMany({
    where: { status: "AKTIF" },
    orderBy: { tanggalMulai: "asc" },
    include: {
      _count: { select: { pendaftaran: true } },
      pendaftaran: { where: { pesertaId: peserta.id } },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Kegiatan Aktif"
        subtitle="Kegiatan yang sedang dibuka untuk pendaftaran"
        icon={<CalendarCheck2 className="h-5 w-5" />}
      />

      {kegiatanAktif.length === 0 ? (
        <ContentCard>
          <p className="text-sm text-slate-500">
            Belum ada kegiatan aktif saat ini.
          </p>
        </ContentCard>
      ) : (
        <div className="flex flex-col gap-4">
          {kegiatanAktif.map((kegiatan) => {
            const sudahDaftar = kegiatan.pendaftaran.length > 0;
            const kuotaPenuh =
              kegiatan.kuota != null &&
              kegiatan._count.pendaftaran >= kegiatan.kuota;

            return (
              <ContentCard
                key={kegiatan.id}
                className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h3 className="font-semibold text-slate-900">
                    {kegiatan.judul}
                  </h3>
                  {kegiatan.deskripsi && (
                    <p className="mt-1 text-sm text-slate-500">
                      {kegiatan.deskripsi}
                    </p>
                  )}
                  <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600">
                    <span>{formatDateTime(kegiatan.tanggalMulai)}</span>
                    {kegiatan.lokasi && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {kegiatan.lokasi}
                      </span>
                    )}
                  </p>
                  <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-400">
                    <Users className="h-3.5 w-3.5" />
                    {kegiatan._count.pendaftaran} peserta terdaftar
                    {kegiatan.kuota ? ` dari kuota ${kegiatan.kuota}` : ""}
                  </p>
                </div>

                <div className="shrink-0">
                  {sudahDaftar ? (
                    <span className="inline-flex rounded-full bg-emerald-100 px-3.5 py-2 text-sm font-semibold text-emerald-800">
                      Anda sudah terdaftar
                    </span>
                  ) : kuotaPenuh ? (
                    <span className="inline-flex rounded-full bg-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-600">
                      Kuota Penuh
                    </span>
                  ) : (
                    <form action={daftarKegiatanAction.bind(null, kegiatan.id)}>
                      <button
                        type="submit"
                        className={buttonVariants()}
                      >
                        Daftar
                      </button>
                    </form>
                  )}
                </div>
              </ContentCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
