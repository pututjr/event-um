import { cache } from "react";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export type AppSession = {
  user: {
    id: string;
    email: string;
    role: Role;
  };
};

// Memoized per request: layouts and pages both need the current session
// (e.g. dashboard/layout.tsx calls requireRole, then the page calls
// getCurrentPeserta -> getSession again). Without this, each call re-hits
// the Supabase Auth API (a real network round trip, not a local JWT decode)
// and re-queries Postgres. React's cache() dedupes calls with the same
// arguments within a single request/render, so this now only happens once.
const getAppSession = cache(async (): Promise<AppSession | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) return null;

  return { user: { id: dbUser.id, email: dbUser.email, role: dbUser.role } };
});

export async function requireRole(role: Role): Promise<AppSession> {
  const session = await getAppSession();

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== role) {
    redirect(session.user.role === "ADMIN" ? "/admin/peserta" : "/dashboard");
  }

  return session;
}

export async function assertRole(role: Role): Promise<AppSession> {
  const session = await getAppSession();
  if (!session || session.user.role !== role) {
    throw new Error("Tidak diizinkan.");
  }
  return session;
}

export async function getSession(): Promise<AppSession | null> {
  return getAppSession();
}
