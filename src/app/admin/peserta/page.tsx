import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Users, Upload, Plus, Search } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { deletePesertaAction } from "@/lib/actions/peserta";
import { jenisPesertaLabel } from "@/lib/labels";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { PageHeader } from "@/components/ui/page-header";
import { ActionBar } from "@/components/ui/action-bar";
import { StatCard } from "@/components/ui/stat-card";
import { LinkButton } from "@/components/ui/link-button";
import { inputClass } from "@/components/ui/styles";
import {
  tableWrapperClass,
  tableClass,
  theadClass,
  thClass,
  tbodyClass,
  trClass,
  tdClass,
} from "@/components/ui/styles";
import { buttonVariants } from "@/components/ui/button";

const PAGE_SIZE = 15;

export default async function AdminPesertaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);

  const where: Prisma.PesertaWhereInput = q
    ? {
        OR: [
          { namaLengkap: { contains: q } },
          { instansi: { contains: q } },
          { unitProdi: { contains: q } },
          { user: { email: { contains: q } } },
        ],
      }
    : {};

  const [pesertaList, total] = await Promise.all([
    prisma.peserta.findMany({
      where,
      include: { user: true },
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.peserta.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Data Peserta"
        subtitle="Kelola akun dan profil peserta kegiatan"
        icon={<Users className="h-5 w-5" />}
        actions={
          <>
            <LinkButton href="/admin/peserta/import" variant="secondary">
              <Upload className="h-4 w-4" />
              Import Excel
            </LinkButton>
            <LinkButton href="/admin/peserta/baru">
              <Plus className="h-4 w-4" />
              Tambah Peserta
            </LinkButton>
          </>
        }
      />

      <StatCard
        label="Total Peserta Terdaftar"
        value={total}
        icon={<Users className="h-6 w-6" />}
        color="blue"
      />

      <ActionBar>
        <form className="flex w-full max-w-sm gap-2">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              name="q"
              defaultValue={q ?? ""}
              placeholder="Cari nama, email, instansi..."
              className={`${inputClass} pl-9`}
            />
          </div>
          <button type="submit" className={buttonVariants({ variant: "secondary" })}>
            Cari
          </button>
        </form>
      </ActionBar>

      <div className={tableWrapperClass}>
        <table className={tableClass}>
          <thead className={theadClass}>
            <tr>
              <th className={thClass}>Nama</th>
              <th className={thClass}>Email</th>
              <th className={thClass}>Jenis</th>
              <th className={thClass}>Instansi / Unit</th>
              <th className={thClass}>No. HP</th>
              <th className={`${thClass} text-right`}>Aksi</th>
            </tr>
          </thead>
          <tbody className={tbodyClass}>
            {pesertaList.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                  Belum ada data peserta.
                </td>
              </tr>
            )}
            {pesertaList.map((peserta) => (
              <tr key={peserta.id} className={trClass}>
                <td className={`${tdClass} font-medium text-slate-900`}>
                  {peserta.namaLengkap}
                </td>
                <td className={`${tdClass} text-slate-600`}>
                  {peserta.user.email}
                </td>
                <td className={tdClass}>
                  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {jenisPesertaLabel[peserta.jenisPeserta]}
                  </span>
                </td>
                <td className={`${tdClass} text-slate-600`}>
                  {[peserta.instansi, peserta.unitProdi]
                    .filter(Boolean)
                    .join(" · ") || "-"}
                </td>
                <td className={`${tdClass} text-slate-600`}>
                  {peserta.noHp || "-"}
                </td>
                <td className={tdClass}>
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/peserta/${peserta.id}`}
                      className={buttonVariants({ variant: "secondary", size: "sm" })}
                    >
                      Detail
                    </Link>
                    <form action={deletePesertaAction.bind(null, peserta.id)}>
                      <ConfirmSubmitButton
                        confirmText={`Hapus peserta "${peserta.namaLengkap}"? Data pendaftaran terkait akan ikut terhapus.`}
                        className={buttonVariants({ variant: "danger", size: "sm" })}
                      >
                        Hapus
                      </ConfirmSubmitButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 text-sm">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/peserta?${new URLSearchParams({
                ...(q ? { q } : {}),
                page: String(p),
              }).toString()}`}
              className={
                p === currentPage
                  ? buttonVariants({ size: "sm" })
                  : buttonVariants({ variant: "secondary", size: "sm" })
              }
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
