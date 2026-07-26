"use client";

import { useTransition } from "react";
import type { StatusPendaftaran } from "@prisma/client";

import { updatePendaftaranStatusAction } from "@/lib/actions/kegiatan";

export function PendaftaranStatusSelect({
  pendaftaranId,
  status,
}: {
  pendaftaranId: string;
  status: StatusPendaftaran;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={isPending}
      onChange={(e) => {
        const newStatus = e.target.value as StatusPendaftaran;
        startTransition(async () => {
          await updatePendaftaranStatusAction(pendaftaranId, newStatus);
        });
      }}
      className="rounded-md border border-slate-300 px-2 py-1 text-xs disabled:opacity-60"
    >
      <option value="TERDAFTAR">Terdaftar</option>
      <option value="HADIR">Hadir</option>
      <option value="SERTIFIKAT_TERBIT">Sertifikat Terbit</option>
    </select>
  );
}
