"use client";

import { useActionState } from "react";
import { UploadCloud } from "lucide-react";

import {
  uploadTemplateAction,
  type TemplateFormState,
} from "@/lib/actions/sertifikat";
import { TextField, SelectField } from "@/components/ui/form-field";
import { buttonVariants } from "@/components/ui/button";

const initialState: TemplateFormState = {};

const halamanOptions = [
  { value: "1", label: "1 Halaman" },
  { value: "2", label: "2 Halaman" },
];

export function TemplateSertifikatForm() {
  const [state, formAction, isPending] = useActionState(
    uploadTemplateAction,
    initialState
  );

  return (
    <form
      action={formAction}
      encType="multipart/form-data"
      className="flex max-w-xl flex-col gap-5"
    >
      <TextField
        label="Nama Template"
        name="nama"
        placeholder="Contoh: Template Sertifikat Peserta"
        required
        error={state.fieldErrors?.nama}
      />
      <SelectField
        label="Jumlah Halaman"
        name="jumlahHalaman"
        defaultValue="1"
        options={halamanOptions}
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="file" className="text-sm font-medium text-slate-700">
          File Template (.docx)
        </label>
        <input
          id="file"
          type="file"
          name="file"
          accept=".docx"
          required
          className="rounded-[10px] border border-slate-300 bg-white px-3.5 py-2.5 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700"
        />
        <p className="text-xs text-slate-500">
          Gunakan placeholder: {"{{nama}}"}, {"{{gelar}}"}, {"{{instansi}}"},{" "}
          {"{{kegiatan}}"}, {"{{tanggal}}"}, {"{{lokasi}}"},{" "}
          {"{{nomor_sertifikat}}"}, {"{{narasumber}}"}, {"{{jabatan}}"},{" "}
          {"{{unit}}"}.
        </p>
      </div>

      {state.error && (
        <p className="rounded-[10px] border border-red-100 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-[10px] border border-emerald-100 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-800">
          Template berhasil diunggah.
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className={buttonVariants({ className: "w-fit" })}
      >
        <UploadCloud className="h-4 w-4" />
        {isPending ? "Mengunggah..." : "Unggah Template"}
      </button>
    </form>
  );
}
