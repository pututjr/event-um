"use client";

import { useActionState } from "react";

import type { KegiatanFormState } from "@/lib/actions/kegiatan";

const initialState: KegiatanFormState = {};

const statusOptions = [
  { value: "AKTIF", label: "Aktif" },
  { value: "SELESAI", label: "Selesai" },
  { value: "DIBATALKAN", label: "Dibatalkan" },
];

export function KegiatanForm({
  action,
  defaultValues,
  submitLabel,
  onSuccessMessage,
}: {
  action: (
    prevState: KegiatanFormState,
    formData: FormData
  ) => Promise<KegiatanFormState>;
  defaultValues?: {
    judul?: string;
    deskripsi?: string;
    lokasi?: string;
    tanggalMulai?: string;
    tanggalSelesai?: string;
    kuota?: string;
    status?: string;
  };
  submitLabel: string;
  onSuccessMessage?: string;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="judul" className="text-sm font-medium text-slate-700">
          Judul Kegiatan
        </label>
        <input
          id="judul"
          name="judul"
          defaultValue={defaultValues?.judul}
          required
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
        {state.fieldErrors?.judul && (
          <p className="text-xs text-red-600">{state.fieldErrors.judul}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="deskripsi"
          className="text-sm font-medium text-slate-700"
        >
          Deskripsi
        </label>
        <textarea
          id="deskripsi"
          name="deskripsi"
          rows={3}
          defaultValue={defaultValues?.deskripsi}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="lokasi" className="text-sm font-medium text-slate-700">
          Lokasi
        </label>
        <input
          id="lokasi"
          name="lokasi"
          defaultValue={defaultValues?.lokasi}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="tanggalMulai"
            className="text-sm font-medium text-slate-700"
          >
            Tanggal &amp; Waktu Mulai
          </label>
          <input
            id="tanggalMulai"
            name="tanggalMulai"
            type="datetime-local"
            defaultValue={defaultValues?.tanggalMulai}
            required
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
          {state.fieldErrors?.tanggalMulai && (
            <p className="text-xs text-red-600">
              {state.fieldErrors.tanggalMulai}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="tanggalSelesai"
            className="text-sm font-medium text-slate-700"
          >
            Tanggal &amp; Waktu Selesai
          </label>
          <input
            id="tanggalSelesai"
            name="tanggalSelesai"
            type="datetime-local"
            defaultValue={defaultValues?.tanggalSelesai}
            required
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
          {state.fieldErrors?.tanggalSelesai && (
            <p className="text-xs text-red-600">
              {state.fieldErrors.tanggalSelesai}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="kuota" className="text-sm font-medium text-slate-700">
            Kuota Peserta (opsional)
          </label>
          <input
            id="kuota"
            name="kuota"
            type="number"
            min={0}
            defaultValue={defaultValues?.kuota}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="status" className="text-sm font-medium text-slate-700">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={defaultValues?.status ?? "AKTIF"}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {state.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.success && onSuccessMessage && (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {onSuccessMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 w-fit rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
      >
        {isPending ? "Menyimpan..." : submitLabel}
      </button>
    </form>
  );
}
