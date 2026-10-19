/**
 * "O que você vende?" → its plural, for "312 lanches por mês".
 *
 * A heuristic for Portuguese only, and an editable one: the screen shows "No
 * plural fica lanches" and a tap lets the person fix it. English and Spanish
 * ask for the plural in a second field instead (see EquilibrioScreen).
 *
 * Pure: `node --test` runs it (`unidade.test.ts`).
 */

/** Words that are the same in the plural ("o lápis", "os lápis"). */
const INVARIAVEIS = /(ps|x|[^áéíóúâêôãõ]s)$/;

/** Last-syllable stress: an "-s" word whose plural adds "-es" (mês → meses). */
const OXITONA_S = /[áéíóúâêô]s$/;

const ACENTO_FORTE: Record<string, string> = { e: 'é', o: 'ó' };

/**
 * "-ão" words that do not take "-ões". The rule's best-known miss is "pão" →
 * "pões", and a bakery is exactly who opens this app, so the common ones are
 * listed. Anything else is fixed by editing the plural on screen.
 */
const EXCECOES_AO: Record<string, string> = {
  pão: 'pães',
  cão: 'cães',
  alemão: 'alemães',
  capitão: 'capitães',
  mão: 'mãos',
  irmão: 'irmãos',
  cidadão: 'cidadãos',
  grão: 'grãos',
};

function pluralDaPalavra(palavra: string): string {
  const p = palavra;
  const minuscula = p.toLowerCase();

  const excecao = EXCECOES_AO[minuscula];
  if (excecao) {
    return p[0] === p[0]!.toUpperCase() ? excecao[0]!.toUpperCase() + excecao.slice(1) : excecao;
  }
  if (minuscula.endsWith('ão')) return `${p.slice(0, -2)}ões`;
  if (minuscula.endsWith('m')) return `${p.slice(0, -1)}ns`;

  // -l: "papel" → "papéis", "lençol" → "lençóis", "jornal" → "jornais",
  // "funil" → "funis", "fóssil" → "fósseis", "azul" → "azuis". An accent
  // already in the word means the stress is not on the last syllable (túnel,
  // fóssil), which changes both "-il" and whether "-el"/"-ol" gain an accent.
  const temAcento = /[áéíóúâêôãõ]/.test(minuscula);
  if (minuscula.endsWith('il')) return `${p.slice(0, -2)}${temAcento ? 'eis' : 'is'}`;
  if (/[aeou]l$/.test(minuscula)) {
    const vogal = minuscula.at(-2)!;
    const nova = !temAcento ? (ACENTO_FORTE[vogal] ?? vogal) : vogal;
    return `${p.slice(0, -2)}${nova}is`;
  }

  if (minuscula.endsWith('s')) {
    if (OXITONA_S.test(minuscula)) {
      // "mês" → "meses", "gás" → "gases": the accent drops with the new syllable.
      const sem =
        p.slice(0, -2) +
        p
          .at(-2)!
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
      return `${sem}ses`;
    }
    if (INVARIAVEIS.test(minuscula)) return p;
  }
  if (minuscula.endsWith('x')) return p;
  if (/[rz]$/.test(minuscula)) return `${p}es`;
  return `${p}s`;
}

/**
 * Plural of a sold unit. Only the first word changes: "corte de cabelo" →
 * "cortes de cabelo". Empty means "venda", whose plural the caller takes from
 * the locale (`vazio`).
 */
export function pluralizar(singular: string): string {
  const limpo = singular.trim().replace(/\s+/g, ' ');
  if (!limpo) return '';
  const [primeira, ...resto] = limpo.split(' ');
  return [pluralDaPalavra(primeira!), ...resto].join(' ');
}

export type Unidade = { singular: string; plural: string };

/**
 * The unit a business sells, ready to print: what the person typed, or the
 * locale's "venda/vendas" when nothing was. The plural is the edited one if
 * there is one, else generated — but only in Portuguese (`gerarPlural`): in
 * English and Spanish the rule does not apply, and the screen asks for it.
 */
export function resolverUnidade(
  singularDigitado: string | null,
  pluralDigitado: string | null,
  padrao: Unidade,
  gerarPlural: boolean,
): Unidade {
  const singular = singularDigitado?.trim();
  if (!singular) return padrao;
  const plural = pluralDigitado?.trim();
  if (plural) return { singular, plural };
  return { singular, plural: gerarPlural ? pluralizar(singular) : singular };
}
