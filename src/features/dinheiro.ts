/**
 * Money formatting. The plan stores centavos as integers (see
 * `src/data/types.ts`); this is the only place that turns them into text.
 *
 * Copied from Pendurô (`src/features/dinheiro.ts`), plus the short forms the
 * break-even card and the PDF use ("R$ 9.984", "312").
 *
 * Pure: `node --test` runs it.
 *
 * Hand-rolled rather than `Intl.NumberFormat`, which depends on the ICU data
 * bundled in the JS engine — present on some builds and not others, and a
 * silently different thousands separator is the kind of thing nobody notices
 * until someone reads "R$ 1,234.56" in a plan they show the bank.
 *
 * The currency symbol comes from the locale files, so this holds no
 * user-facing string of its own (invariant 6).
 */

/**
 * Separators of the current language: "1.240,50" in Portuguese and Spanish,
 * "1,240.50" in English. Set once per render by the root layout
 * (`definirLocaleNumerico`); defaults to Portuguese, which is also what the
 * tests use.
 */
let separadores = { milhar: '.', decimal: ',' };

export function definirLocaleNumerico(locale: string): void {
  separadores = locale.startsWith('en')
    ? { milhar: ',', decimal: '.' }
    : { milhar: '.', decimal: ',' };
}

/** Splits centavos into the grouped integer part and the two decimals. */
export function formatarValor(centavos: number): string {
  const negativo = centavos < 0;
  const absoluto = Math.abs(Math.round(centavos));

  const reais = Math.floor(absoluto / 100);
  const resto = absoluto % 100;

  const inteiro = String(reais).replace(/\B(?=(\d{3})+(?!\d))/g, separadores.milhar);
  const decimais = String(resto).padStart(2, '0');

  return `${negativo ? '-' : ''}${inteiro}${separadores.decimal}${decimais}`;
}

/** `formatarValor` prefixed with the locale's currency symbol. */
export function formatarMoeda(centavos: number, simbolo: string): string {
  return `${simbolo} ${formatarValor(centavos)}`;
}

/**
 * Parses what the numeric keypad produced into centavos, or `null` when there
 * is no number in it.
 *
 * Accepts both separators because a Brazilian keyboard gives a comma and a
 * numeric keypad often gives a dot, and treats the LAST one as the decimal
 * mark so "1.234,56" and "1234.56" both land on 123456.
 */
export function parseValor(texto: string): number | null {
  const limpo = texto.replace(/[^\d.,]/g, '');
  if (!limpo) return null;

  const ultimo = Math.max(limpo.lastIndexOf(','), limpo.lastIndexOf('.'));
  const inteiro = (ultimo === -1 ? limpo : limpo.slice(0, ultimo)).replace(/[.,]/g, '');
  const decimais = ultimo === -1 ? '' : limpo.slice(ultimo + 1).replace(/[.,]/g, '');

  if (!inteiro && !decimais) return null;

  const centavos =
    Number(inteiro || '0') * 100 + Number(decimais.padEnd(2, '0').slice(0, 2) || '0');
  return Number.isFinite(centavos) ? centavos : null;
}

/**
 * Centavos typed digit by digit into a text field: "2500" is R$ 25,00, and a
 * formatted value being edited ("R$ 25,0" after a backspace) reads back as
 * its digits. Nine digits caps it under R$ 10 milhões, like the keypad.
 * `null` when no digit is left.
 */
export function centavosDigitados(texto: string): number | null {
  const digitos = texto.replace(/\D/g, '').slice(0, 9);
  return digitos ? Number(digitos) : null;
}

/** A whole number with the thousands grouped: 1240 → "1.240". */
export function formatarInteiro(valor: number): string {
  const negativo = valor < 0;
  const inteiro = String(Math.abs(Math.round(valor))).replace(
    /\B(?=(\d{3})+(?!\d))/g,
    separadores.milhar,
  );
  return `${negativo ? '-' : ''}${inteiro}`;
}

/**
 * Like `formatarMoeda`, but drops ",00" from whole amounts: "R$ 9.984",
 * "R$ 32,50". The break-even card and the PDF read cleaner without the zeros.
 */
export function formatarMoedaCurta(centavos: number, simbolo: string): string {
  const redondo = Math.round(centavos) % 100 === 0;
  const negativo = centavos < 0;
  const texto = redondo
    ? formatarInteiro(Math.abs(centavos) / 100)
    : formatarValor(Math.abs(centavos));
  return `${negativo ? '−' : ''}${simbolo} ${texto}`;
}

/**
 * Centavos as typed in a money field, without the symbol: "6.240" for a whole
 * amount, "12,50" otherwise. Empty for `null`, so a field never shows "0,00"
 * the person did not type.
 */
export function formatarEntrada(centavos: number | null): string {
  if (centavos === null) return '';
  return Math.round(centavos) % 100 === 0
    ? formatarInteiro(centavos / 100)
    : formatarValor(centavos);
}

/**
 * Parses a typed amount into centavos, or `null` when there is no number.
 *
 * Unlike `parseValor` (Pendurô's keypad, where the last separator is always
 * the decimal mark), this reads what a Brazilian types in a text field: a
 * comma is the decimal mark, and a dot followed by exactly three digits is a
 * thousands separator — "6.240" is six thousand, not six reais. A lone dot
 * with one or two digits after it ("12.50") is still taken as decimals, for
 * keyboards that only offer a dot.
 */
export function parseDinheiro(texto: string): number | null {
  // In English the roles swap: "6,240.50". Normalise to the Brazilian form.
  const local =
    separadores.decimal === '.' ? texto.replace(/[.,]/g, (c) => (c === '.' ? ',' : '.')) : texto;
  const limpo = local.replace(/[^\d.,]/g, '');
  if (!/\d/.test(limpo)) return null;

  let inteiro: string;
  let decimais = '';
  if (limpo.includes(',')) {
    const ultima = limpo.lastIndexOf(',');
    inteiro = limpo.slice(0, ultima).replace(/[.,]/g, '');
    decimais = limpo.slice(ultima + 1).replace(/[.,]/g, '');
  } else {
    const grupos = limpo.split('.');
    const ultimo = grupos[grupos.length - 1] ?? '';
    if (grupos.length > 1 && ultimo.length !== 3) {
      decimais = grupos.pop() ?? '';
      inteiro = grupos.join('');
    } else {
      inteiro = grupos.join('');
    }
  }

  const centavos = Number(inteiro || '0') * 100 + Number(decimais.padEnd(2, '0').slice(0, 2));
  return Number.isFinite(centavos) ? centavos : null;
}
