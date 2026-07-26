"use client";

import { useActionState } from "react";

import {
  importPesertaAction,
  type ImportState,
} from "@/lib/actions/import-peserta";

const initialState: ImportState = {};

export function ImportPesertaForm() {
  const [state, formAction, isPending] = useActionState(
    importPesertaAction,
    initialState
  );

  return (
    <div className="flex flex-col gap-6">
      <form
        action={formAction}
        encType="multipart/form-data"
        className="flex max-w-md flex-col gap-3"
      >
        <input
          type="file"
          name="file"
          accept=".xlsx,.xls"
          required
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        {state.error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </p>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="w-fit rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {isPending ? "Mengimpor..." : "Import Peserta"}
        </button>
      </form>

      {state.summary && (
        <div className="max-w-xl rounded-md border border-slate-200 bg-white p-4 text-sm">
          <p>
            Total baris diproses:{" "}
            <span className="font-medium">{state.summary.total}</span>
          </p>
          <p>
            Berhasil ditambahkan:{" "}
            <span className="font-medium text-emerald-700">
              {state.summary.created}
            </span>
          </p>
          {state.password && (
            <p className="mt-2 rounded-md bg-emerald-50 px-3 py-2 text-emerald-800">
              Password sementara untuk seluruh peserta hasil import:{" "}
              <code className="font-semibold">{state.password}</code>
              <br />
              Sampaikan password ini secara manual. Peserta dapat menggantinya
              lewat halaman Profil.
            </p>
          )}
          {state.summary.skipped.length > 0 && (
            <div className="mt-3">
              <p className="font-medium text-amber-700">
                Dilewati ({state.summary.skipped.length}):
              </p>
              <ul className="mt-1 list-disc pl-5 text-slate-600">
                {state.summary.skipped.map((s, i) => (
                  <li key={i}>
                    Baris {s.row} ({s.email || "-"}): {s.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
