import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

export type SertifikatData = {
  nama: string;
  gelar: string;
  instansi: string;
  kegiatan: string;
  tanggal: string;
  lokasi: string;
  nomor_sertifikat: string;
  narasumber: string;
  jabatan: string;
  unit: string;
};

export function renderSertifikatDocx(
  templateBuffer: Buffer,
  data: SertifikatData
): Buffer {
  const zip = new PizZip(templateBuffer);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: { start: "{{", end: "}}" },
  });

  doc.render(data);

  return doc.getZip().generate({ type: "nodebuffer" });
}
