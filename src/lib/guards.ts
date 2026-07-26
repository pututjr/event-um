import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";

import { auth } from "@/auth";

export async function requireRole(role: Role) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== role) {
    redirect(session.user.role === "ADMIN" ? "/admin/peserta" : "/dashboard");
  }

  return session;
}

export async function assertRole(role: Role) {
  const session = await auth();
  if (!session?.user || session.user.role !== role) {
    throw new Error("Tidak diizinkan.");
  }
  return session;
}
