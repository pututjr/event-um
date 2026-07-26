import { requireRole } from "@/lib/guards";
import { AppShell } from "@/components/app-shell";

const navItems = [
  { href: "/admin/peserta", label: "Peserta" },
  { href: "/admin/peserta/import", label: "Import Excel" },
  { href: "/admin/kegiatan", label: "Kegiatan" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole("ADMIN");

  return (
    <AppShell
      title="Panel Admin"
      navItems={navItems}
      userEmail={session.user.email ?? ""}
    >
      {children}
    </AppShell>
  );
}
