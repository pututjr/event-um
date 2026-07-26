"use client";

import { useActionState } from "react";

import {
  updateProfilAction,
  type ProfilFormState,
} from "@/lib/actions/profil";

const initialState: ProfilFormState = {};

export function ProfilForm({
  defaultValues,
}: {
  defaultValues: {
    namaLengkap: string;
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
    <form action={formAction} className="flex max-w-lg flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="namaLengkap" className="text-sm font-medium text-slate-700">
          Nama Lengkap
        </label>
        <input
          id="namaLengkap"
          name="namaLengkap"
          defaultValue={defaultValues.namaLengkap}
          required
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
        {state.fieldErrors?.namaLengkap && (
          <p className="text-xs text-red-600">
            {state.fieldErrors.namaLengkap}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="noHp" className="text-sm font-medium text-slate-700">
          No. HP
        </label>
        <input
          id="noHp"
          name="noHp"
          defaultValue={defaultValues.noHp}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="instansi" className="text-sm font-medium text-slate-700">
          Instansi
        </label>
        <input
          id="instansi"
          name="instansi"
          defaultValue={defaultValues.instansi}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="unitProdi" className="text-sm font-medium text-slate-700">
          Unit / Program Studi
        </label>
        <input
          id="unitProdi"
          name="unitProdi"
          defaultValue={defaultValues.unitProdi}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
      </div>

      {state.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Profil berhasil diperbarui.
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 w-fit rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
      >
        {isPending ? "Menyimpan..." : "Simpan Profil"}
      </button>
    </form>
  );
}
