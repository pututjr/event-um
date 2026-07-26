import { getCurrentPeserta } from "@/lib/current-peserta";
import { ProfilForm } from "@/components/profil-form";
import { ChangePasswordForm } from "@/components/change-password-form";

const jenisLabel: Record<string, string> = {
  MAHASISWA: "Mahasiswa",
  DOSEN: "Dosen",
  TENDIK: "Tenaga Kependidikan",
  UMUM: "Umum",
};

export default async function ProfilPage() {
  const peserta = await getCurrentPeserta();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Profil</h2>
        <p className="text-sm text-slate-500">
          Kelola informasi akun dan data diri Anda.
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Data Diri
        </h3>
        <div className="max-w-lg rounded-lg border border-slate-200 bg-white p-4 text-sm">
          <p className="text-slate-500">Email</p>
          <p className="font-medium text-slate-900">{peserta.user.email}</p>
          <p className="mt-2 text-slate-500">Jenis Peserta</p>
          <p className="font-medium text-slate-900">
            {jenisLabel[peserta.jenisPeserta]}
          </p>
        </div>
        <ProfilForm
          defaultValues={{
            namaLengkap: peserta.namaLengkap,
            noHp: peserta.noHp ?? "",
            instansi: peserta.instansi ?? "",
            unitProdi: peserta.unitProdi ?? "",
          }}
        />
      </section>

      <section className="flex flex-col gap-4 border-t border-slate-200 pt-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Ganti Password
        </h3>
        <ChangePasswordForm />
      </section>
    </div>
  );
}
