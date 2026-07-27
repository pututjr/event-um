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

async function getAppSession(): Promise<AppSession | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) return null;

  return { user: { id: dbUser.id, email: dbUser.email, role: dbUser.role } };
}

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
