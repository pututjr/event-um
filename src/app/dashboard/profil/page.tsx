import { UserCircle } from "lucide-react";

import { getCurrentPeserta } from "@/lib/current-peserta";
import { ProfilForm } from "@/components/profil-form";
import { ChangePasswordForm } from "@/components/change-password-form";
import { jenisPesertaLabel } from "@/lib/labels";
import { PageHeader } from "@/components/ui/page-header";
import { ContentCard } from "@/components/ui/content-card";
import { sectionLabelClass } from "@/components/ui/styles";

export default async function ProfilPage() {
  const peserta = await getCurrentPeserta();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Profil"
        subtitle="Kelola informasi akun dan data diri Anda"
        icon={<UserCircle className="h-5 w-5" />}
      />

      <ContentCard className="flex flex-col gap-4">
        <h3 className={sectionLabelClass}>Data Diri</h3>
        <div className="max-w-lg rounded-[10px] border border-slate-200 bg-slate-50 p-4 text-sm">
          <p className="text-slate-500">Email</p>
          <p className="font-medium text-slate-900">{peserta.user.email}</p>
          <p className="mt-2 text-slate-500">Jenis Peserta</p>
          <p className="font-medium text-slate-900">
            {jenisPesertaLabel[peserta.jenisPeserta]}
          </p>
        </div>
        <ProfilForm
          defaultValues={{
            namaLengkap: peserta.namaLengkap,
            gelar: peserta.gelar ?? "",
            noHp: peserta.noHp ?? "",
            instansi: peserta.instansi ?? "",
            unitProdi: peserta.unitProdi ?? "",
          }}
        />
      </ContentCard>

      <ContentCard className="flex flex-col gap-4">
        <h3 className={sectionLabelClass}>Ganti Password</h3>
        <ChangePasswordForm />
      </ContentCard>
    </div>
  );
}
