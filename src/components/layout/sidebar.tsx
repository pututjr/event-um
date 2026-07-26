"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";

import { logoutAction } from "@/lib/actions/auth";

export type SidebarNavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

function useActiveHref(navItems: SidebarNavItem[]) {
  const pathname = usePathname();

  let bestMatch: string | null = null;
  for (const item of navItems) {
    const matches = pathname === item.href || pathname.startsWith(`${item.href}/`);
    if (matches && (bestMatch === null || item.href.length > bestMatch.length)) {
      bestMatch = item.href;
    }
  }
  return bestMatch;
}

export function Sidebar({
  roleLabel,
  userEmail,
  navItems,
}: {
  roleLabel: string;
  userEmail: string;
  navItems: SidebarNavItem[];
}) {
  const activeHref = useActiveHref(navItems);

  return (
    <>
      {/* Desktop / tablet: fixed sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col bg-navy text-white md:flex">
        <div className="flex items-center gap-3 px-6 py-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-white/15 text-sm font-bold">
            UM
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">EVENT UM</p>
            <p className="text-xs text-white/60">{roleLabel}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {navItems.map((item) => (
            <SidebarLink
              key={item.href}
              item={item}
              isActive={item.href === activeHref}
            />
          ))}
        </nav>

        <div className="border-t border-white/10 px-4 py-4">
          <p className="truncate text-xs text-white/60" title={userEmail}>
            {userEmail}
          </p>
          <form action={logoutAction} className="mt-2">
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-[10px] px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Keluar
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile: condensed top bar */}
      <header className="sticky top-0 z-20 flex flex-col gap-2 bg-navy px-4 py-3 text-white md:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-white/15 text-xs font-bold">
              UM
            </div>
            <p className="text-sm font-semibold">EVENT UM</p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-[10px] px-2.5 py-1.5 text-xs font-medium text-white/80 hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Keluar
            </button>
          </form>
        </div>
        <nav className="flex gap-1 overflow-x-auto">
          {navItems.map((item) => (
            <SidebarLink
              key={item.href}
              item={item}
              isActive={item.href === activeHref}
              mobile
            />
          ))}
        </nav>
      </header>
    </>
  );
}

function SidebarLink({
  item,
  isActive,
  mobile = false,
}: {
  item: SidebarNavItem;
  isActive: boolean;
  mobile?: boolean;
}) {
  if (mobile) {
    return (
      <Link
        href={item.href}
        className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[10px] px-3 py-1.5 text-xs font-medium transition-colors ${
          isActive
            ? "bg-white/15 text-white"
            : "text-white/70 hover:bg-white/10 hover:text-white"
        }`}
      >
        {item.icon}
        {item.label}
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-colors ${
        isActive
          ? "bg-white/15 text-white"
          : "text-white/70 hover:bg-white/10 hover:text-white"
      }`}
    >
      <span className="shrink-0">{item.icon}</span>
      {item.label}
    </Link>
  );
}
