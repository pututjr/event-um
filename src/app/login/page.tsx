import { redirect } from "next/navigation";
import { CalendarRange } from "lucide-react";

import { auth } from "@/auth";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect(session.user.role === "ADMIN" ? "/admin/peserta" : "/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-page px-4">
      <div className="w-full max-w-sm overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col items-center gap-3 bg-gradient-to-r from-navy to-navy-light px-8 py-8 text-center text-white">
          <div className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-white/15">
            <CalendarRange className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">EVENT UM</h1>
            <p className="mt-1 text-sm text-white/70">
              Masuk untuk mengelola atau mengikuti kegiatan.
            </p>
          </div>
        </div>
        <div className="px-8 py-8">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
