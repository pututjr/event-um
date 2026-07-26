import { FileCog } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { deleteTemplateAction } from "@/lib/actions/sertifikat";
import { TemplateSertifikatForm } from "@/components/template-sertifikat-form";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { PageHeader } from "@/components/ui/page-header";
import { ContentCard } from "@/components/ui/content-card";
import { buttonVariants } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";
import {
  tableWrapperClass,
  tableClass,
  theadClass,
  thClass,
  tbodyClass,
  trClass,
  tdClass,
  sectionLabelClass,
} from "@/components/ui/styles";

export default async function TemplateSertifikatPage() {
  const templates = await prisma.sertifikatTemplate.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { sertifikat: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Template Sertifikat"
        subtitle="Kelola template DOCX untuk penerbitan sertifikat"
        icon={<FileCog className="h-5 w-5" />}
      />

      <ContentCard className="flex flex-col gap-4">
        <h3 className={sectionLabelClass}>Unggah Template Baru</h3>
        <TemplateSertifikatForm />
      </ContentCard>

      <div className={tableWrapperClass}>
        <table className={tableClass}>
          <thead className={theadClass}>
            <tr>
              <th className={thClass}>Nama</th>
              <th className={thClass}>Halaman</th>
              <th className={thClass}>File</th>
              <th className={thClass}>Dipakai</th>
              <th className={thClass}>Diunggah</th>
              <th className={`${thClass} text-right`}>Aksi</th>
            </tr>
          </thead>
          <tbody className={tbodyClass}>
            {templates.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                  Belum ada template sertifikat.
                </td>
              </tr>
            )}
            {templates.map((t) => (
              <tr key={t.id} className={trClass}>
                <td className={`${tdClass} font-medium text-slate-900`}>
                  {t.nama}
                </td>
                <td className={`${tdClass} text-slate-600`}>{t.jumlahHalaman}</td>
                <td className={`${tdClass} text-slate-600`}>{t.fileName}</td>
                <td className={`${tdClass} text-slate-600`}>
                  {t._count.sertifikat} sertifikat
                </td>
                <td className={`${tdClass} text-slate-600`}>
                  {formatDateTime(t.createdAt)}
                </td>
                <td className={tdClass}>
                  <div className="flex justify-end">
                    <form action={deleteTemplateAction.bind(null, t.id)}>
                      <ConfirmSubmitButton
                        confirmText={`Hapus template "${t.nama}"? Template yang sudah dipakai tidak bisa dihapus.`}
                        className={buttonVariants({ variant: "danger", size: "sm" })}
                      >
                        Hapus
                      </ConfirmSubmitButton>
                    </form>
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
