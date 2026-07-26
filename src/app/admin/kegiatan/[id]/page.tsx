import { notFound } from "next/navigation";
import { CalendarCog } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { updateKegiatanAction, deleteKegiatanAction } from "@/lib/actions/kegiatan";
import { KegiatanForm } from "@/components/kegiatan-form";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { PendaftaranStatusSelect } from "@/components/pendaftaran-status-select";
import { formatDateTime, toDatetimeLocalValue } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { ContentCard } from "@/components/ui/content-card";
import { BackLink } from "@/components/ui/back-link";
import { buttonVariants } from "@/components/ui/button";
import {
  sectionLabelClass,
  tableWrapperClass,
  tableClass,
  theadClass,
  thClass,
  tbodyClass,
  trClass,
  tdClass,
} from "@/components/ui/styles";

export default async function KegiatanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const kegiatan = await prisma.kegiatan.findUnique({
    where: { id },
    include: {
      pendaftaran: {
        include: { peserta: { include: { user: true } } },
        orderBy: { tanggalDaftar: "asc" },
      },
    },
  });

  if (!kegiatan) {
    notFound();
  }

  const updateAction = updateKegiatanAction.bind(null, kegiatan.id);

  return (
    <div className="flex flex-col gap-6">
      <BackLink href="/admin/kegiatan">Kembali ke daftar kegiatan</BackLink>

      <PageHeader title={kegiatan.judul} icon={<CalendarCog className="h-5 w-5" />} />

      <ContentCard className="flex flex-col gap-4">
        <h3 className={sectionLabelClass}>Ubah Data Kegiatan</h3>
        <KegiatanForm
          action={updateAction}
          submitLabel="Simpan Perubahan"
          onSuccessMessage="Perubahan kegiatan tersimpan."
          defaultValues={{
            judul: kegiatan.judul,
            deskripsi: kegiatan.deskripsi ?? "",
            lokasi: kegiatan.lokasi ?? "",
            tanggalMulai: toDatetimeLocalValue(kegiatan.tanggalMulai),
            tanggalSelesai: toDatetimeLocalValue(kegiatan.tanggalSelesai),
            kuota: kegiatan.kuota != null ? String(kegiatan.kuota) : "",
            status: kegiatan.status,
          }}
        />
      </ContentCard>

      <ContentCard className="flex flex-col gap-3" padded={false}>
        <h3 className={`${sectionLabelClass} px-6 pt-6`}>
          Peserta Terdaftar ({kegiatan.pendaftaran.length})
        </h3>
        {kegiatan.pendaftaran.length === 0 ? (
          <p className="px-6 pb-6 text-sm text-slate-500">
            Belum ada peserta yang mendaftar kegiatan ini.
          </p>
        ) : (
          <div className={`${tableWrapperClass} border-none shadow-none`}>
            <table className={tableClass}>
              <thead className={theadClass}>
                <tr>
                  <th className={thClass}>Nama</th>
                  <th className={thClass}>Email</th>
                  <th className={thClass}>Tanggal Daftar</th>
                  <th className={thClass}>Status</th>
                </tr>
              </thead>
              <tbody className={tbodyClass}>
                {kegiatan.pendaftaran.map((p) => (
                  <tr key={p.id} className={trClass}>
                    <td className={`${tdClass} font-medium text-slate-900`}>
                      {p.peserta.namaLengkap}
                    </td>
                    <td className={`${tdClass} text-slate-600`}>
                      {p.peserta.user.email}
                    </td>
                    <td className={`${tdClass} text-slate-600`}>
                      {formatDateTime(p.tanggalDaftar)}
                    </td>
                    <td className={tdClass}>
                      <PendaftaranStatusSelect
                        pendaftaranId={p.id}
                        status={p.status}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ContentCard>

      <ContentCard>
        <form action={deleteKegiatanAction.bind(null, kegiatan.id)}>
          <ConfirmSubmitButton
            confirmText={`Hapus kegiatan "${kegiatan.judul}"? Seluruh data pendaftaran terkait akan ikut terhapus.`}
            className={buttonVariants({ variant: "danger" })}
          >
            Hapus Kegiatan
          </ConfirmSubmitButton>
        </form>
      </ContentCard>
    </div>
  );
}
