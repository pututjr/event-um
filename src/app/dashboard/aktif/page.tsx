import { prisma } from "@/lib/prisma";
import { getCurrentPeserta } from "@/lib/current-peserta";
import { daftarKegiatanAction } from "@/lib/actions/pendaftaran";
import { formatDateTime } from "@/lib/format";

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
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Kegiatan Aktif
        </h2>
        <p className="text-sm text-slate-500">
          Kegiatan yang sedang dibuka untuk pendaftaran.
        </p>
      </div>

      {kegiatanAktif.length === 0 ? (
        <p className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500">
          Belum ada kegiatan aktif saat ini.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {kegiatanAktif.map((kegiatan) => {
            const sudahDaftar = kegiatan.pendaftaran.length > 0;
            const kuotaPenuh =
              kegiatan.kuota != null &&
              kegiatan._count.pendaftaran >= kegiatan.kuota;

            return (
              <div
                key={kegiatan.id}
                className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h3 className="font-medium text-slate-900">
                    {kegiatan.judul}
                  </h3>
                  {kegiatan.deskripsi && (
                    <p className="mt-1 text-sm text-slate-500">
                      {kegiatan.deskripsi}
                    </p>
                  )}
                  <p className="mt-2 text-sm text-slate-600">
                    {formatDateTime(kegiatan.tanggalMulai)}
                    {kegiatan.lokasi ? ` · ${kegiatan.lokasi}` : ""}
                  </p>
                  <p className="text-xs text-slate-400">
                    {kegiatan._count.pendaftaran} peserta terdaftar
                    {kegiatan.kuota ? ` dari kuota ${kegiatan.kuota}` : ""}
                  </p>
                </div>

                <div className="shrink-0">
                  {sudahDaftar ? (
                    <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-800">
                      Anda sudah terdaftar
                    </span>
                  ) : kuotaPenuh ? (
                    <span className="inline-flex rounded-full bg-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600">
                      Kuota Penuh
                    </span>
                  ) : (
                    <form action={daftarKegiatanAction.bind(null, kegiatan.id)}>
                      <button
                        type="submit"
                        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                      >
                        Daftar
                      </button>
                    </form>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
