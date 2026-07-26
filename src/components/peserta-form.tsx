"use client";

import { useActionState } from "react";

import type { PesertaFormState } from "@/lib/actions/peserta";

const initialState: PesertaFormState = {};

const jenisOptions = [
  { value: "MAHASISWA", label: "Mahasiswa" },
  { value: "DOSEN", label: "Dosen" },
  { value: "TENDIK", label: "Tenaga Kependidikan" },
  { value: "UMUM", label: "Umum" },
];

export function PesertaForm({
  action,
  defaultValues,
  submitLabel,
  disableEmail = false,
}: {
  action: (
    prevState: PesertaFormState,
    formData: FormData
  ) => Promise<PesertaFormState>;
  defaultValues?: {
    namaLengkap?: string;
    email?: string;
    noHp?: string;
    instansi?: string;
    unitProdi?: string;
    jenisPeserta?: string;
  };
  submitLabel: string;
  disableEmail?: boolean;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  if (state.success) {
    return (
      <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
        <p className="font-medium">Data peserta berhasil disimpan.</p>
        {state.generatedPassword && (
          <p className="mt-2">
            Password sementara:{" "}
            <code className="font-semibold">{state.generatedPassword}</code>
            <br />
            Sampaikan password ini secara manual kepada peserta (belum ada
            integrasi email/WhatsApp).
          </p>
        )}
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4 max-w-xl">
      <Field
        label="Nama Lengkap"
        name="namaLengkap"
        defaultValue={defaultValues?.namaLengkap}
        error={state.fieldErrors?.namaLengkap}
        required
      />
      <Field
        label="Email"
        name="email"
        type="email"
        defaultValue={defaultValues?.email}
        error={state.fieldErrors?.email}
        required
        disabled={disableEmail}
      />
      <Field
        label="No. HP"
        name="noHp"
        defaultValue={defaultValues?.noHp}
        error={state.fieldErrors?.noHp}
      />
      <Field
        label="Instansi"
        name="instansi"
        defaultValue={defaultValues?.instansi}
        error={state.fieldErrors?.instansi}
      />
      <Field
        label="Unit / Program Studi"
        name="unitProdi"
        defaultValue={defaultValues?.unitProdi}
        error={state.fieldErrors?.unitProdi}
      />

      <div className="flex flex-col gap-1">
        <label htmlFor="jenisPeserta" className="text-sm font-medium text-slate-700">
          Jenis Peserta
        </label>
        <select
          id="jenisPeserta"
          name="jenisPeserta"
          defaultValue={defaultValues?.jenisPeserta ?? "UMUM"}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        >
          {jenisOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {state.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
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

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  error,
  required,
  disabled,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        disabled={disabled}
        className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
