"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";

import {
  updateProfilAction,
  type ProfilFormState,
} from "@/lib/actions/profil";
import { TextField } from "@/components/ui/form-field";
import { buttonVariants } from "@/components/ui/button";

const initialState: ProfilFormState = {};

export function ProfilForm({
  defaultValues,
}: {
  defaultValues: {
    namaLengkap: string;
    gelar: string;
    noHp: string;
    instansi: string;
    unitProdi: string;
  };
}) {
  const [state, formAction, isPending] = useActionState(
    updateProfilAction,
    initialState
  );

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-5">
      <TextField
        label="Nama Lengkap"
        name="namaLengkap"
        defaultValue={defaultValues.namaLengkap}
        required
        error={state.fieldErrors?.namaLengkap}
      />
      <TextField
        label="Gelar (opsional)"
        name="gelar"
        placeholder="Contoh: S.Kom., M.T."
        defaultValue={defaultValues.gelar}
      />
      <TextField
        label="No. HP"
        name="noHp"
        defaultValue={defaultValues.noHp}
      />
      <TextField
        label="Instansi"
        name="instansi"
        defaultValue={defaultValues.instansi}
      />
      <TextField
        label="Unit / Program Studi"
        name="unitProdi"
        defaultValue={defaultValues.unitProdi}
      />

      {state.error && (
        <p className="rounded-[10px] border border-red-100 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-[10px] border border-emerald-100 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-800">
          Profil berhasil diperbarui.
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className={buttonVariants({ className: "mt-1 w-fit" })}
      >
        <Save className="h-4 w-4" />
        {isPending ? "Menyimpan..." : "Simpan Profil"}
      </button>
    </form>
  );
}
