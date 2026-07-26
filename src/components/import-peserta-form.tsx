"use client";

import { useActionState } from "react";
import { UploadCloud } from "lucide-react";

import {
  importPesertaAction,
  type ImportState,
} from "@/lib/actions/import-peserta";
import { buttonVariants } from "@/components/ui/button";
import { cardClass } from "@/components/ui/styles";

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
          className="rounded-[10px] border border-slate-300 bg-white px-3.5 py-2.5 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700"
        />
        {state.error && (
          <p className="rounded-[10px] border border-red-100 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            {state.error}
          </p>
        )}
        <button
          type="submit"
          disabled={isPending}
          className={buttonVariants({ className: "w-fit" })}
        >
          <UploadCloud className="h-4 w-4" />
          {isPending ? "Mengimpor..." : "Import Peserta"}
        </button>
      </form>

      {state.summary && (
        <div className={`${cardClass} max-w-xl p-5 text-sm`}>
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
            <p className="mt-3 rounded-[10px] border border-emerald-100 bg-emerald-50 px-3.5 py-2.5 text-emerald-800">
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
