"use client";

import { useState, useTransition } from "react";

import { resetPasswordAction } from "@/lib/actions/peserta";

export function ResetPasswordButton({ pesertaId }: { pesertaId: string }) {
  const [password, setPassword] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (!window.confirm("Buat password sementara baru untuk peserta ini?")) {
            return;
          }
          startTransition(async () => {
            const result = await resetPasswordAction(pesertaId);
            setPassword(result.password);
          });
        }}
        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-60"
      >
        {isPending ? "Memproses..." : "Reset Password"}
      </button>
      {password && (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Password baru:{" "}
          <code className="font-semibold">{password}</code>
          <br />
          Sampaikan password ini secara manual kepada peserta.
        </p>
      )}
    </div>
  );
}
