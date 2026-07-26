import {
  LayoutDashboard,
  History,
  CalendarCheck2,
  Award,
  UserCircle,
} from "lucide-react";

import { requireRole } from "@/lib/guards";
import { PageShell } from "@/components/layout/page-shell";
import type { SidebarNavItem } from "@/components/layout/sidebar";

const navItems: SidebarNavItem[] = [
  {
    href: "/dashboard",
    label: "Ringkasan",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    href: "/dashboard/riwayat",
    label: "Riwayat Kegiatan",
    icon: <History className="h-4 w-4" />,
  },
  {
    href: "/dashboard/aktif",
    label: "Kegiatan Aktif",
    icon: <CalendarCheck2 className="h-4 w-4" />,
  },
  {
    href: "/dashboard/sertifikat",
    label: "Sertifikat Saya",
    icon: <Award className="h-4 w-4" />,
  },
  {
    href: "/dashboard/profil",
    label: "Profil",
    icon: <UserCircle className="h-4 w-4" />,
  },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole("PESERTA");

  return (
    <PageShell
      roleLabel="Dashboard Peserta"
      navItems={navItems}
      userEmail={session.user.email ?? ""}
    >
      {children}
    </PageShell>
  );
}
