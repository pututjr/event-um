import { format } from "date-fns";
import { id } from "date-fns/locale";

export function formatDateTime(date: Date): string {
  return format(date, "d MMM yyyy, HH:mm", { locale: id });
}

export function formatDate(date: Date): string {
  return format(date, "d MMM yyyy", { locale: id });
}

export function toDatetimeLocalValue(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm");
}
