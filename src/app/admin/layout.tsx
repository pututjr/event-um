import { Users, FileSpreadsheet, CalendarDays } from "lucide-react";

import { requireRole } from "@/lib/guards";
import { PageShell } from "@/components/layout/page-shell";
import type { SidebarNavItem } from "@/components/layout/sidebar";

const navItems: SidebarNavItem[] = [
  {
    href: "/admin/peserta",
    label: "Peserta",
    icon: <Users className="h-4 w-4" />,
  },
  {
    href: "/admin/peserta/import",
    label: "Import Excel",
    icon: <FileSpreadsheet className="h-4 w-4" />,
  },
  {
    href: "/admin/kegiatan",
    label: "Kegiatan",
    icon: <CalendarDays className="h-4 w-4" />,
  },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole("ADMIN");

  return (
    <PageShell
      roleLabel="Panel Admin"
      navItems={navItems}
      userEmail={session.user.email ?? ""}
    >
      {children}
    </PageShell>
  );
}
