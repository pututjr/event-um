import { Award } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { ContentCard } from "@/components/ui/content-card";
import { GenerateSertifikatPanel } from "@/components/generate-sertifikat-panel";
import { selectClass } from "@/components/ui/styles";
import { buttonVariants } from "@/components/ui/button";

export default async function GenerateSertifikatPage({
  searchParams,
}: {
  searchParams: Promise<{ kegiatanId?: string }>;
}) {
  const { kegiatanId } = await searchParams;

  const [kegiatanList, templates] = await Promise.all([
    prisma.kegiatan.findMany({
      orderBy: { tanggalMulai: "desc" },
      select: { id: true, judul: true },
    }),
    prisma.sertifikatTemplate.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, nama: true },
    }),
  ]);

  const selectedKegiatanId = kegiatanId || kegiatanList[0]?.id;

  const pendaftaranList = selectedKegiatanId
    ? await prisma.pendaftaran.findMany({
        where: {
          kegiatanId: selectedKegiatanId,
          status: { in: ["HADIR", "SERTIFIKAT_TERBIT"] },
        },
        include: { peserta: { include: { user: true } }, sertifikat: true },
        orderBy: { tanggalDaftar: "asc" },
      })
    : [];

  const peserta = pendaftaranList.map((p) => ({
    pendaftaranId: p.id,
    nama: p.peserta.namaLengkap,
    email: p.peserta.user.email,
    pendaftaranStatus: p.status,
    sertifikatStatus: p.sertifikat?.status,
    nomorSertifikat: p.sertifikat?.nomorSertifikat,
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Generate Sertifikat"
        subtitle="Terbitkan sertifikat untuk peserta yang sudah hadir"
        icon={<Award className="h-5 w-5" />}
      />

      <ContentCard>
        <form className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">
              Kegiatan
            </label>
            <select
              name="kegiatanId"
              defaultValue={selectedKegiatanId}
              className={`${selectClass} min-w-[280px]`}
            >
              {kegiatanList.length === 0 && <option value="">Belum ada kegiatan</option>}
              {kegiatanList.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.judul}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className={buttonVariants({ variant: "secondary" })}>
            Tampilkan
          </button>
        </form>
      </ContentCard>

      {selectedKegiatanId && (
        <GenerateSertifikatPanel
          kegiatanId={selectedKegiatanId}
          templates={templates.map((t) => ({ id: t.id, nama: t.nama }))}
          peserta={peserta}
        />
      )}
    </div>
  );
}
