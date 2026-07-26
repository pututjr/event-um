import { UserPlus } from "lucide-react";

import { createPesertaAction } from "@/lib/actions/peserta";
import { PesertaForm } from "@/components/peserta-form";
import { PageHeader } from "@/components/ui/page-header";
import { ContentCard } from "@/components/ui/content-card";
import { BackLink } from "@/components/ui/back-link";

export default function PesertaBaruPage() {
  return (
    <div className="flex flex-col gap-4">
      <BackLink href="/admin/peserta">Kembali ke daftar peserta</BackLink>

      <PageHeader
        title="Tambah Peserta"
        subtitle="Akun login peserta akan dibuat otomatis dengan password sementara."
        icon={<UserPlus className="h-5 w-5" />}
      />

      <ContentCard>
        <PesertaForm action={createPesertaAction} submitLabel="Simpan Peserta" />
      </ContentCard>
    </div>
  );
}
