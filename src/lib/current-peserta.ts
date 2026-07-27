import { redirect } from "next/navigation";

import { getSession } from "@/lib/guards";
import { prisma } from "@/lib/prisma";

export async function getCurrentPeserta() {
  const session = await getSession();
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
