import { CalendarPlus } from "lucide-react";

import { createKegiatanAction } from "@/lib/actions/kegiatan";
import { KegiatanForm } from "@/components/kegiatan-form";
import { PageHeader } from "@/components/ui/page-header";
import { ContentCard } from "@/components/ui/content-card";
import { BackLink } from "@/components/ui/back-link";

export default function KegiatanBaruPage() {
  return (
    <div className="flex flex-col gap-4">
      <BackLink href="/admin/kegiatan">Kembali ke daftar kegiatan</BackLink>

      <PageHeader
        title="Tambah Kegiatan"
        icon={<CalendarPlus className="h-5 w-5" />}
      />

      <ContentCard>
        <KegiatanForm
          action={createKegiatanAction}
          submitLabel="Simpan Kegiatan"
          onSuccessMessage="Kegiatan berhasil ditambahkan."
        />
      </ContentCard>
    </div>
  );
}
