"use client";

import { useState, useTransition } from "react";
import { Award, Zap } from "lucide-react";
import type { StatusPendaftaran, StatusSertifikat } from "@prisma/client";

import {
  generateSertifikatAction,
  generateMassalAction,
} from "@/lib/actions/sertifikat";
import { buttonVariants } from "@/components/ui/button";
import { selectClass } from "@/components/ui/styles";
import { PendaftaranStatusBadge } from "@/components/status-badge";

type PesertaRow = {
  pendaftaranId: string;
  nama: string;
  email: string;
  pendaftaranStatus: StatusPendaftaran;
  sertifikatStatus?: StatusSertifikat;
  nomorSertifikat?: string;
};

const sertifikatStatusLabel: Record<StatusSertifikat, string> = {
  PENDING: "Diproses",
  GENERATED: "Terbit",
  FAILED: "Gagal",
};

const sertifikatStatusStyle: Record<StatusSertifikat, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  GENERATED: "bg-emerald-100 text-emerald-800",
  FAILED: "bg-red-100 text-red-800",
};

export function GenerateSertifikatPanel({
  kegiatanId,
  templates,
  peserta,
}: {
  kegiatanId: string;
  templates: { id: string; nama: string }[];
  peserta: PesertaRow[];
}) {
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? "");
  const [rowMessages, setRowMessages] = useState<Record<string, string>>({});
  const [massalSummary, setMassalSummary] = useState<{
    total: number;
    berhasil: number;
    gagal: string[];
  } | null>(null);
  const [massalError, setMassalError] = useState<string | null>(null);
  const [pendingRow, startRowTransition] = useTransition();
  const [pendingMassal, startMassalTransition] = useTransition();

  if (templates.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Belum ada template sertifikat. Unggah template terlebih dahulu di
        halaman Template Sertifikat.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5 sm:max-w-xs">
        <label className="text-sm font-medium text-slate-700">
          Template Sertifikat
        </label>
        <select
          value={templateId}
          onChange={(e) => setTemplateId(e.target.value)}
          className={selectClass}
        >
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nama}
            </option>
          ))}
        </select>
      </div>

      <div>
        <button
          type="button"
          disabled={pendingMassal || !templateId}
          onClick={() => {
            if (
              !window.confirm(
                "Generate sertifikat untuk seluruh peserta berstatus Hadir pada kegiatan ini?"
              )
            ) {
              return;
            }
            setMassalError(null);
            setMassalSummary(null);
            startMassalTransition(async () => {
              const result = await generateMassalAction(kegiatanId, templateId);
              if (result.error) setMassalError(result.error);
              if (result.summary) setMassalSummary(result.summary);
            });
          }}
          className={buttonVariants({ className: "w-fit" })}
        >
          <Zap className="h-4 w-4" />
          {pendingMassal ? "Memproses..." : "Generate Massal"}
        </button>

        {massalError && (
          <p className="mt-2 rounded-[10px] border border-red-100 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            {massalError}
          </p>
        )}
        {massalSummary && (
          <div className="mt-2 rounded-[10px] border border-slate-200 bg-white p-3.5 text-sm">
            <p>
              Berhasil {massalSummary.berhasil} dari {massalSummary.total}{" "}
              peserta.
            </p>
            {massalSummary.gagal.length > 0 && (
              <ul className="mt-1 list-disc pl-5 text-red-700">
                {massalSummary.gagal.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3.5">Nama</th>
              <th className="px-5 py-3.5">Email</th>
              <th className="px-5 py-3.5">Status Kehadiran</th>
              <th className="px-5 py-3.5">Sertifikat</th>
              <th className="px-5 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {peserta.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                  Belum ada peserta yang hadir pada kegiatan ini.
                </td>
              </tr>
            )}
            {peserta.map((p) => (
              <tr key={p.pendaftaranId} className="transition-colors hover:bg-slate-50">
                <td className="px-5 py-4 font-medium text-slate-900">{p.nama}</td>
                <td className="px-5 py-4 text-slate-600">{p.email}</td>
                <td className="px-5 py-4">
                  <PendaftaranStatusBadge status={p.pendaftaranStatus} />
                </td>
                <td className="px-5 py-4">
                  {p.sertifikatStatus ? (
                    <span
                      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${sertifikatStatusStyle[p.sertifikatStatus]}`}
                    >
                      {sertifikatStatusLabel[p.sertifikatStatus]}
                      {p.nomorSertifikat ? ` · ${p.nomorSertifikat}` : ""}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">Belum digenerate</span>
                  )}
                </td>
                <td className="px-5 py-4 text-right">
                  <button
                    type="button"
                    disabled={pendingRow || !templateId}
                    onClick={() => {
                      setRowMessages((prev) => ({ ...prev, [p.pendaftaranId]: "" }));
                      startRowTransition(async () => {
                        const result = await generateSertifikatAction(
                          p.pendaftaranId,
                          templateId
                        );
                        setRowMessages((prev) => ({
                          ...prev,
                          [p.pendaftaranId]: result.message,
                        }));
                      });
                    }}
                    className={buttonVariants({ variant: "secondary", size: "sm" })}
                  >
                    <Award className="h-3.5 w-3.5" />
                    {p.sertifikatStatus ? "Regenerate" : "Generate"}
                  </button>
                  {rowMessages[p.pendaftaranId] && (
                    <p className="mt-1 max-w-xs text-xs text-slate-500">
                      {rowMessages[p.pendaftaranId]}
                    </p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
