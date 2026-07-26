import { notFound } from "next/navigation";
import { UserCog } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { updatePesertaAction, deletePesertaAction } from "@/lib/actions/peserta";
import { PesertaForm } from "@/components/peserta-form";
import { ResetPasswordButton } from "@/components/reset-password-button";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { PendaftaranStatusBadge } from "@/components/status-badge";
import { formatDateTime } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { ContentCard } from "@/components/ui/content-card";
import { BackLink } from "@/components/ui/back-link";
import { buttonVariants } from "@/components/ui/button";
import { sectionLabelClass, tableWrapperClass, tableClass, theadClass, thClass, tbodyClass, trClass, tdClass } from "@/components/ui/styles";

export default async function PesertaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const peserta = await prisma.peserta.findUnique({
    where: { id },
    include: {
      user: true,
      pendaftaran: {
        include: { kegiatan: true },
        orderBy: { tanggalDaftar: "desc" },
      },
    },
  });

  if (!peserta) {
    notFound();
  }

  const updateAction = updatePesertaAction.bind(null, peserta.id);

  return (
    <div className="flex flex-col gap-6">
      <BackLink href="/admin/peserta">Kembali ke daftar peserta</BackLink>

      <PageHeader
        title={peserta.namaLengkap}
        subtitle={peserta.user.email}
        icon={<UserCog className="h-5 w-5" />}
      />

      <ContentCard className="flex flex-col gap-4">
        <h3 className={sectionLabelClass}>Ubah Data</h3>
        <PesertaForm
          action={updateAction}
          submitLabel="Simpan Perubahan"
          defaultValues={{
            namaLengkap: peserta.namaLengkap,
            email: peserta.user.email,
            gelar: peserta.gelar ?? "",
            noHp: peserta.noHp ?? "",
            instansi: peserta.instansi ?? "",
            unitProdi: peserta.unitProdi ?? "",
            jenisPeserta: peserta.jenisPeserta,
          }}
        />
      </ContentCard>

      <ContentCard className="flex flex-col gap-3">
        <h3 className={sectionLabelClass}>Akun &amp; Keamanan</h3>
        <ResetPasswordButton pesertaId={peserta.id} />
      </ContentCard>

      <ContentCard className="flex flex-col gap-3" padded={false}>
        <h3 className={`${sectionLabelClass} px-6 pt-6`}>Riwayat Kegiatan</h3>
        {peserta.pendaftaran.length === 0 ? (
          <p className="px-6 pb-6 text-sm text-slate-500">
            Peserta ini belum pernah mendaftar kegiatan.
          </p>
        ) : (
          <div className={`${tableWrapperClass} border-none shadow-none`}>
            <table className={tableClass}>
              <thead className={theadClass}>
                <tr>
                  <th className={thClass}>Kegiatan</th>
                  <th className={thClass}>Tanggal Daftar</th>
                  <th className={thClass}>Status</th>
                </tr>
              </thead>
              <tbody className={tbodyClass}>
                {peserta.pendaftaran.map((p) => (
                  <tr key={p.id} className={trClass}>
                    <td className={`${tdClass} font-medium text-slate-900`}>
                      {p.kegiatan.judul}
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
      </ContentCard>

      <ContentCard>
        <form action={deletePesertaAction.bind(null, peserta.id)}>
          <ConfirmSubmitButton
            confirmText={`Hapus peserta "${peserta.namaLengkap}"? Data pendaftaran terkait akan ikut terhapus.`}
            className={buttonVariants({ variant: "danger" })}
          >
            Hapus Peserta
          </ConfirmSubmitButton>
        </form>
      </ContentCard>
    </div>
  );
}
