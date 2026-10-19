/**
 * Task dates: stored as 'YYYY-MM-DD' (a calendar day, no time zone), shown as
 * "28 out". The month names come from the locale, so this holds no copy.
 *
 * Pure: `node --test` runs it (`datas.test.ts`).
 */

/** The local calendar day of `data`, as 'YYYY-MM-DD'. */
export function isoDoDia(data: Date): string {
  const a = data.getFullYear();
  const m = String(data.getMonth() + 1).padStart(2, '0');
  const d = String(data.getDate()).padStart(2, '0');
  return `${a}-${m}-${d}`;
}

/** Local midnight of an 'YYYY-MM-DD' day; null for anything else. */
export function diaDoIso(iso: string | null): Date | null {
  if (!iso) return null;
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!partes) return null;
  const data = new Date(Number(partes[1]), Number(partes[2]) - 1, Number(partes[3]));
  return Number.isNaN(data.getTime()) ? null : data;
}

/** "28 out" — `meses` is the locale's twelve short month names. */
export function formatarDiaCurto(iso: string | null, meses: readonly string[]): string | null {
  const data = diaDoIso(iso);
  if (!data) return null;
  return `${data.getDate()} ${meses[data.getMonth()] ?? ''}`.trim();
}

/** The hour a task's reminder fires on its day. */
export const HORA_LEMBRETE = 9;

/** When a task's reminder fires (epoch ms): its day at 9:00, local time. */
export function momentoDoLembrete(iso: string | null): number | null {
  const data = diaDoIso(iso);
  if (!data) return null;
  data.setHours(HORA_LEMBRETE, 0, 0, 0);
  return data.getTime();
}
