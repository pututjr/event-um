"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";

import { loginAction, type LoginState } from "@/lib/actions/auth";
import { inputClass, labelClass } from "@/components/ui/styles";
import { buttonVariants } from "@/components/ui/button";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputClass}
          placeholder="nama@um.ac.id"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className={labelClass}>
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
          placeholder="••••••••"
        />
      </div>

      {state.error && (
        <p className="rounded-[10px] border border-red-100 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className={buttonVariants({ className: "mt-1 w-full" })}
      >
        <LogIn className="h-4 w-4" />
        {isPending ? "Memproses..." : "Masuk"}
      </button>
    </form>
  );
}
