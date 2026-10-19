/**
 * Small helpers for the PDF templates. Every string that reaches the HTML
 * goes through `esc` — the person's answers above all, and the translations
 * too, since they carry those answers as parameters.
 */

export function esc(texto: string | number): string {
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** An answer, escaped, or the discreet "—" for a skipped or empty one. */
export function respostaOuTraco(texto: string | undefined | null): string {
  const limpo = texto?.trim();
  return limpo ? esc(limpo) : '<span class="vazio">—</span>';
}

/** "Outubro de 2026" / "October 2026": `formatar` is the locale's pattern. */
export function mesAno(
  epoch: number,
  meses: readonly string[],
  formatar: (mes: string, ano: number) => string,
): string {
  const d = new Date(epoch);
  return formatar(meses[d.getMonth()] ?? '', d.getFullYear());
}

/** Turns "Lanches da Vila" into "Lanches-da-Vila" for the file name. */
export function slug(nome: string): string {
  const limpo = nome
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return limpo.slice(0, 60) || 'Plano';
}
