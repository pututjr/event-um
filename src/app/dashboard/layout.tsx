import { requireRole } from "@/lib/guards";
import { AppShell } from "@/components/app-shell";

const navItems = [
  { href: "/dashboard", label: "Ringkasan" },
  { href: "/dashboard/riwayat", label: "Riwayat Kegiatan" },
  { href: "/dashboard/aktif", label: "Kegiatan Aktif" },
  { href: "/dashboard/sertifikat", label: "Sertifikat Saya" },
  { href: "/dashboard/profil", label: "Profil" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole("PESERTA");

  return (
    <AppShell
      title="Dashboard Peserta"
      navItems={navItems}
      userEmail={session.user.email ?? ""}
    >
      {children}
    </AppShell>
  );
}
