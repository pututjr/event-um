import { UserCircle } from "lucide-react";

import { requireRole } from "@/lib/guards";
import { ChangePasswordForm } from "@/components/change-password-form";
import { PageHeader } from "@/components/ui/page-header";
import { ContentCard } from "@/components/ui/content-card";
import { sectionLabelClass } from "@/components/ui/styles";

export default async function AdminProfilPage() {
  const session = await requireRole("ADMIN");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Profil Admin"
        subtitle="Kelola akun login Anda"
        icon={<UserCircle className="h-5 w-5" />}
      />

      <ContentCard className="flex flex-col gap-4">
        <h3 className={sectionLabelClass}>Data Akun</h3>
        <div className="max-w-lg rounded-[10px] border border-slate-200 bg-slate-50 p-4 text-sm">
          <p className="text-slate-500">Email</p>
          <p className="font-medium text-slate-900">{session.user.email}</p>
        </div>
      </ContentCard>

      <ContentCard className="flex flex-col gap-4">
        <h3 className={sectionLabelClass}>Ganti Password</h3>
        <ChangePasswordForm />
      </ContentCard>
    </div>
  );
}
