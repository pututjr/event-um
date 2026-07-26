import { Award } from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";

export default function SertifikatSayaPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Sertifikat Saya"
        subtitle="Fitur unduh sertifikat sedang dalam pengembangan"
        icon={<Award className="h-5 w-5" />}
      />

      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
        <Award className="mx-auto h-10 w-10 text-slate-300" />
        <p className="mt-3 text-sm text-slate-500">
          Segera hadir. Sertifikat kegiatan yang sudah terbit akan tersedia di
          halaman ini pada sprint berikutnya.
        </p>
      </div>
    </div>
  );
}
