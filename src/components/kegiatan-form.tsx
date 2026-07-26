"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";

import type { KegiatanFormState } from "@/lib/actions/kegiatan";
import { TextField, TextAreaField, SelectField } from "@/components/ui/form-field";
import { buttonVariants } from "@/components/ui/button";

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
    <form action={formAction} className="flex max-w-xl flex-col gap-5">
      <TextField
        label="Judul Kegiatan"
        name="judul"
        defaultValue={defaultValues?.judul}
        required
        error={state.fieldErrors?.judul}
      />

      <TextAreaField
        label="Deskripsi"
        name="deskripsi"
        rows={3}
        defaultValue={defaultValues?.deskripsi}
      />

      <TextField
        label="Lokasi"
        name="lokasi"
        defaultValue={defaultValues?.lokasi}
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <TextField
          label="Tanggal & Waktu Mulai"
          name="tanggalMulai"
          type="datetime-local"
          defaultValue={defaultValues?.tanggalMulai}
          required
          error={state.fieldErrors?.tanggalMulai}
        />
        <TextField
          label="Tanggal & Waktu Selesai"
          name="tanggalSelesai"
          type="datetime-local"
          defaultValue={defaultValues?.tanggalSelesai}
          required
          error={state.fieldErrors?.tanggalSelesai}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <TextField
          label="Kuota Peserta (opsional)"
          name="kuota"
          type="number"
          min={0}
          defaultValue={defaultValues?.kuota}
        />
        <SelectField
          label="Status"
          name="status"
          defaultValue={defaultValues?.status ?? "AKTIF"}
          options={statusOptions}
        />
      </div>

      {state.error && (
        <p className="rounded-[10px] border border-red-100 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.success && onSuccessMessage && (
        <p className="rounded-[10px] border border-emerald-100 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-800">
          {onSuccessMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className={buttonVariants({ className: "mt-1 w-fit" })}
      >
        <Save className="h-4 w-4" />
        {isPending ? "Menyimpan..." : submitLabel}
      </button>
    </form>
  );
}
