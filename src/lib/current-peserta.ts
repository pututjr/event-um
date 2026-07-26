import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getCurrentPeserta() {
  const session = await auth();
  if (!session?.user || session.user.role !== "PESERTA") {
    redirect("/login");
  }

  const peserta = await prisma.peserta.findUnique({
    where: { userId: session.user.id },
    include: { user: true },
  });

  if (!peserta) {
    redirect("/login");
  }

  return peserta;
}
