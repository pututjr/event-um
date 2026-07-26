import Link from "next/link";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { deletePesertaAction } from "@/lib/actions/peserta";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Data Peserta
          </h2>
          <p className="text-sm text-slate-500">{total} peserta terdaftar</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/peserta/import"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Import Excel
          </Link>
          <Link
            href="/admin/peserta/baru"
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            + Tambah Peserta
          </Link>
        </div>
      </div>

      <form className="flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Cari nama, email, instansi..."
          className="w-full max-w-sm rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Cari
        </button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Jenis</th>
              <th className="px-4 py-3">Instansi / Unit</th>
              <th className="px-4 py-3">No. HP</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pesertaList.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  Belum ada data peserta.
                </td>
              </tr>
            )}
            {pesertaList.map((peserta) => (
              <tr key={peserta.id}>
                <td className="px-4 py-3 font-medium text-slate-900">
                  {peserta.namaLengkap}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {peserta.user.email}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {peserta.jenisPeserta}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {[peserta.instansi, peserta.unitProdi]
                    .filter(Boolean)
                    .join(" · ") || "-"}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {peserta.noHp || "-"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/peserta/${peserta.id}`}
                      className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                    >
                      Detail
                    </Link>
                    <form
                      action={deletePesertaAction.bind(null, peserta.id)}
                    >
                      <ConfirmSubmitButton
                        confirmText={`Hapus peserta "${peserta.namaLengkap}"? Data pendaftaran terkait akan ikut terhapus.`}
                        className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
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
              className={`rounded-md px-3 py-1.5 ${
                p === currentPage
                  ? "bg-slate-900 text-white"
                  : "border border-slate-300 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
