import type { Quadro } from '@/data/types';

/**
 * The boards answered one question at a time: questions are data, not
 * screens. One `FormularioGuiado` renders all three.
 *
 * Each field's copy lives in the locales under `quadros.<quadro>.<campo>`:
 * `bloco` (the caps label and the review's short name), `pergunta`, `ajuda`
 * ("Por que isso importa?") and `exemplo`. This file only fixes the ids and
 * their order, which are what the database stores.
 *
 * Pure (the only import is a type): `node --test` runs what depends on it.
 */

export type DefinicaoQuadro = {
  id: Quadro;
  campos: readonly string[];
};

export const LEAN: DefinicaoQuadro = {
  id: 'lean',
  campos: [
    'problema',
    'paraQuem',
    'diferencial',
    'solucao',
    'canais',
    'receitas',
    'custos',
    'metricas',
    'vantagem',
  ],
};

/**
 * Order from the plan (§5). The design's Formulario numbers Atividades,
 * Recursos and Parcerias 7–9, but its numbers are illustrative; the plan's
 * list is the behaviour.
 */
export const BMC: DefinicaoQuadro = {
  id: 'bmc',
  campos: [
    'segmentos',
    'proposta',
    'canais',
    'relacionamento',
    'receitas',
    'recursos',
    'atividades',
    'parcerias',
    'custos',
  ],
};

export const PERSONA: DefinicaoQuadro = {
  id: 'persona',
  campos: ['quem', 'rotina', 'quer', 'incomoda', 'decide', 'proposta'],
};

export const QUADROS: Record<Quadro, DefinicaoQuadro> = {
  lean: LEAN,
  bmc: BMC,
  persona: PERSONA,
};

/**
 * The persona's illustration, stored as an answer (`campo = 'ilustracao'`).
 * Not one of the six fields: it never counts in the progress.
 */
export const CAMPO_ILUSTRACAO = 'ilustracao';
export type Ilustracao = 'mulher' | 'homem';
export const ILUSTRACAO_PADRAO: Ilustracao = 'mulher';

/**
 * BMC fields that already exist in the Lean Canvas. The first time the BMC is
 * opened they come pre-filled from there, editable, marked "veio da sua ideia".
 */
export const BMC_DO_LEAN: Readonly<Record<string, string>> = {
  segmentos: 'paraQuem',
  proposta: 'diferencial',
  canais: 'canais',
  receitas: 'receitas',
  custos: 'custos',
};
