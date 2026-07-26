"use client";

import { useState, useTransition } from "react";
import { KeyRound } from "lucide-react";

import { resetPasswordAction } from "@/lib/actions/peserta";
import { buttonVariants } from "@/components/ui/button";

export function ResetPasswordButton({ pesertaId }: { pesertaId: string }) {
  const [password, setPassword] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col items-start gap-3">
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
        className={buttonVariants({ variant: "secondary" })}
      >
        <KeyRound className="h-4 w-4" />
        {isPending ? "Memproses..." : "Reset Password"}
      </button>
      {password && (
        <p className="rounded-[10px] border border-emerald-100 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-800">
          Password baru:{" "}
          <code className="font-semibold">{password}</code>
          <br />
          Sampaikan password ini secara manual kepada peserta.
        </p>
      )}
    </div>
  );
}
