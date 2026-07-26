import { Sidebar, type SidebarNavItem } from "./sidebar";

export function PageShell({
  roleLabel,
  userEmail,
  navItems,
  children,
}: {
  roleLabel: string;
  userEmail: string;
  navItems: SidebarNavItem[];
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-page">
      <Sidebar roleLabel={roleLabel} userEmail={userEmail} navItems={navItems} />
      <main className="md:pl-64">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
