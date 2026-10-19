/**
 * Domain types for the business plans.
 *
 * MONEY IS IN CENTAVOS, always as an integer. Floating point drifts on
 * repeated sums, and a break-even of 311.99999 lanches rounds the wrong way.
 * Formatting to "R$ 9,90" is `features/dinheiro.ts`'s job, and only its.
 *
 * Pure type declarations: safe to `import type` from the pure modules that
 * `node --test` runs.
 */

export const SEGMENTOS = [
  'alimentacao',
  'beleza',
  'comercio',
  'servicos',
  'moda',
  'saude',
  'educacao',
  'outro',
] as const;
export type Segmento = (typeof SEGMENTOS)[number];

export const ESTAGIOS = ['ideia', 'vendendo'] as const;
export type Estagio = (typeof ESTAGIOS)[number];

/** The boards answered as text, one field at a time. SWOT has its own table. */
export type Quadro = 'lean' | 'bmc' | 'persona';

export const PARTES_SWOT = ['forcas', 'fraquezas', 'oportunidades', 'ameacas'] as const;
export type ParteSwot = (typeof PARTES_SWOT)[number];

export type Negocio = {
  id: string;
  nome: string;
  segmento: Segmento;
  estagio: Estagio;
  /** Epoch milliseconds. */
  criadoEm: number;
  /** Epoch milliseconds; bumped by any write to the business or its answers. */
  atualizadoEm: number;
};

export type NegocioInput = {
  nome: string;
  segmento: Segmento;
  estagio: Estagio;
};

export type Resposta = {
  quadro: Quadro;
  campo: string;
  texto: string;
  /** "Pular por enquanto". */
  pulada: boolean;
  atualizadoEm: number;
};

/** Answers of one business, keyed `quadro` → `campo`. */
export type RespostasPorQuadro = Record<Quadro, Record<string, Resposta>>;

export type SwotItem = {
  id: string;
  parte: ParteSwot;
  texto: string;
  ordem: number;
};

export type Numeros = {
  /** Fixed costs per month, centavos. */
  fixos: number | null;
  /** Cost of one unit sold, centavos. */
  custoUnitario: number | null;
  /** Selling price of one unit, centavos. */
  preco: number | null;
  diasPorMes: number;
  /** "O que você vende?" in the singular: "lanche". */
  unidadeSingular: string | null;
  /** Edited plural; `null` means use the generated one. */
  unidadePlural: string | null;
  /** "Qual é o seu maior custo?" (optional): "carne". */
  maiorCusto: string | null;
};

export const NUMEROS_VAZIOS: Numeros = {
  fixos: null,
  custoUnitario: null,
  preco: null,
  diasPorMes: 26,
  unidadeSingular: null,
  unidadePlural: null,
  maiorCusto: null,
};

export type Tarefa = {
  id: string;
  negocioId: string;
  nome: string;
  /** 'YYYY-MM-DD', or null for no date. */
  data: string | null;
  lembrete: boolean;
  notificacaoId: string | null;
  feita: boolean;
  /** Id of the analysis rule that suggested it, so it is never added twice. */
  origemRegra: string | null;
  ordem: number;
  criadoEm: number;
};

export type TarefaInput = {
  nome: string;
  data?: string | null;
  lembrete?: boolean;
  origemRegra?: string | null;
};
