"use client";

import { useActionState } from "react";
import { KeyRound } from "lucide-react";

import {
  changePasswordAction,
  type PasswordFormState,
} from "@/lib/actions/profil";
import { TextField } from "@/components/ui/form-field";
import { buttonVariants } from "@/components/ui/button";

const initialState: PasswordFormState = {};

export function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(
    changePasswordAction,
    initialState
  );

  return (
    <form action={formAction} className="flex max-w-sm flex-col gap-5">
      <TextField
        label="Password Saat Ini"
        name="currentPassword"
        type="password"
        required
      />
      <TextField
        label="Password Baru"
        name="newPassword"
        type="password"
        required
        minLength={8}
      />
      <TextField
        label="Konfirmasi Password Baru"
        name="confirmPassword"
        type="password"
        required
        minLength={8}
      />

      {state.error && (
        <p className="rounded-[10px] border border-red-100 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-[10px] border border-emerald-100 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-800">
          Password berhasil diperbarui.
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className={buttonVariants({ className: "mt-1 w-fit" })}
      >
        <KeyRound className="h-4 w-4" />
        {isPending ? "Menyimpan..." : "Ganti Password"}
      </button>
    </form>
  );
}
