"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";

import type { PesertaFormState } from "@/lib/actions/peserta";
import { TextField, SelectField } from "@/components/ui/form-field";
import { buttonVariants } from "@/components/ui/button";

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
      <div className="rounded-[10px] border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">
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
    <form action={formAction} className="flex max-w-xl flex-col gap-5">
      <TextField
        label="Nama Lengkap"
        name="namaLengkap"
        defaultValue={defaultValues?.namaLengkap}
        error={state.fieldErrors?.namaLengkap}
        required
      />
      <TextField
        label="Email"
        name="email"
        type="email"
        defaultValue={defaultValues?.email}
        error={state.fieldErrors?.email}
        required
        disabled={disableEmail}
      />
      <TextField
        label="No. HP"
        name="noHp"
        defaultValue={defaultValues?.noHp}
        error={state.fieldErrors?.noHp}
      />
      <TextField
        label="Instansi"
        name="instansi"
        defaultValue={defaultValues?.instansi}
        error={state.fieldErrors?.instansi}
      />
      <TextField
        label="Unit / Program Studi"
        name="unitProdi"
        defaultValue={defaultValues?.unitProdi}
        error={state.fieldErrors?.unitProdi}
      />
      <SelectField
        label="Jenis Peserta"
        name="jenisPeserta"
        defaultValue={defaultValues?.jenisPeserta ?? "UMUM"}
        options={jenisOptions}
      />

      {state.error && (
        <p className="rounded-[10px] border border-red-100 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {state.error}
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
