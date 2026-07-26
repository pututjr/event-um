const ROMAN_MONTHS = [
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
];

const DEFAULT_FORMAT = "{seq}/EVENT-UM/{bulanRomawi}/{tahun}";
const DEFAULT_PADDING = 3;

function pad(n: number, width: number): string {
  return String(n).padStart(width, "0");
}

export function formatNomorSertifikat(seq: number, date: Date = new Date()): string {
  const format = process.env.SERTIFIKAT_NOMOR_FORMAT || DEFAULT_FORMAT;
  const padding = Number(process.env.SERTIFIKAT_NOMOR_PADDING) || DEFAULT_PADDING;

  const bulan = date.getMonth() + 1;

  return format
    .replace("{seq}", pad(seq, padding))
    .replace("{bulan}", pad(bulan, 2))
    .replace("{bulanRomawi}", ROMAN_MONTHS[date.getMonth()])
    .replace("{tahun}", String(date.getFullYear()));
}
