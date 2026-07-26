import type { StatusKegiatan, StatusPendaftaran } from "@prisma/client";

const pendaftaranStyle: Record<StatusPendaftaran, string> = {
  TERDAFTAR: "bg-amber-100 text-amber-800",
  HADIR: "bg-blue-100 text-blue-800",
  SERTIFIKAT_TERBIT: "bg-emerald-100 text-emerald-800",
};

const pendaftaranLabel: Record<StatusPendaftaran, string> = {
  TERDAFTAR: "Terdaftar",
  HADIR: "Hadir",
  SERTIFIKAT_TERBIT: "Sertifikat Terbit",
};

export function PendaftaranStatusBadge({
  status,
}: {
  status: StatusPendaftaran;
}) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${pendaftaranStyle[status]}`}
    >
      {pendaftaranLabel[status]}
    </span>
  );
}

const kegiatanStyle: Record<StatusKegiatan, string> = {
  AKTIF: "bg-emerald-100 text-emerald-800",
  SELESAI: "bg-slate-200 text-slate-700",
  DIBATALKAN: "bg-red-100 text-red-800",
};

const kegiatanLabel: Record<StatusKegiatan, string> = {
  AKTIF: "Aktif",
  SELESAI: "Selesai",
  DIBATALKAN: "Dibatalkan",
};

export function KegiatanStatusBadge({ status }: { status: StatusKegiatan }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${kegiatanStyle[status]}`}
    >
      {kegiatanLabel[status]}
    </span>
  );
}
