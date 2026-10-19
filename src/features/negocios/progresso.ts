import { PARTES_SWOT } from '@/data/types';
import type { Numeros, Quadro, RespostasPorQuadro, SwotItem, Tarefa } from '@/data/types';

import { avaliarNumeros } from '../equilibrio/calculo';
import { QUADROS } from '../quadros/definicoes';

/**
 * How far a business plan has come (plan §4).
 *
 * Progress = filled ÷ total, over the whole plan: 9 Lean + 9 BMC + the 4 SWOT
 * parts with at least one item + 6 Persona + 1 for the break-even (the three
 * numbers valid) + 1 for the action plan (at least one task) = 30. The free
 * tier shows the same percentage — it simply has fewer parts it can fill.
 *
 * A skipped answer ("Pular por enquanto") does not count; nor does the
 * persona's illustration, which is a choice, not an answer.
 *
 * Pure: `node --test` runs it (`progresso.test.ts`).
 */

export type EntradaProgresso = {
  respostas: RespostasPorQuadro;
  swot: readonly SwotItem[];
  numeros: Numeros;
  tarefas: readonly Tarefa[];
};

export type Contagem = { feitos: number; total: number };

/** The parts of a plan, in the order the hub lists them and "Próximo" walks. */
export type Parte = 'lean' | 'equilibrio' | 'bmc' | 'swot' | 'persona' | 'plano';

export type Progresso = {
  /** 0–100, rounded. */
  percentual: number;
  lean: Contagem;
  bmc: Contagem;
  persona: Contagem;
  swot: Contagem;
  /** The three numbers are in and make sense. */
  equilibrio: boolean;
  /** Tasks done of tasks created (for the hub's ring), not the 1-point rule. */
  plano: Contagem;
  /** Nothing filled yet: the hub shows "Por onde começar". */
  vazio: boolean;
};

export const TOTAL_PROGRESSO = 30;

function contarQuadro(respostas: RespostasPorQuadro, quadro: Quadro): Contagem {
  const campos = QUADROS[quadro].campos;
  const preenchidas = respostas[quadro];
  const feitos = campos.filter((campo) => {
    const resposta = preenchidas[campo];
    return resposta !== undefined && !resposta.pulada && resposta.texto.trim() !== '';
  }).length;
  return { feitos, total: campos.length };
}

export function calcularProgresso(entrada: EntradaProgresso): Progresso {
  const lean = contarQuadro(entrada.respostas, 'lean');
  const bmc = contarQuadro(entrada.respostas, 'bmc');
  const persona = contarQuadro(entrada.respostas, 'persona');
  const partes = new Set(
    entrada.swot.filter((item) => item.texto.trim() !== '').map((i) => i.parte),
  );
  const swot = { feitos: PARTES_SWOT.filter((p) => partes.has(p)).length, total: 4 };
  const equilibrio = avaliarNumeros(entrada.numeros).tipo === 'ok';
  const plano = {
    feitos: entrada.tarefas.filter((t) => t.feita).length,
    total: entrada.tarefas.length,
  };

  const pontos =
    lean.feitos +
    bmc.feitos +
    swot.feitos +
    persona.feitos +
    (equilibrio ? 1 : 0) +
    (plano.total > 0 ? 1 : 0);

  return {
    percentual: Math.round((pontos / TOTAL_PROGRESSO) * 100),
    lean,
    bmc,
    persona,
    swot,
    equilibrio,
    plano,
    vazio: pontos === 0,
  };
}

/** Whether a part still has something to do. */
export function parteCompleta(progresso: Progresso, parte: Parte): boolean {
  switch (parte) {
    case 'lean':
    case 'bmc':
    case 'persona':
    case 'swot':
      return progresso[parte].feitos === progresso[parte].total;
    case 'equilibrio':
      return progresso.equilibrio;
    case 'plano':
      return progresso.plano.total > 0;
  }
}

const ORDEM_GRATIS: readonly Parte[] = ['lean', 'equilibrio'];
const ORDEM_PAGA: readonly Parte[] = ['bmc', 'swot', 'persona', 'plano'];

/**
 * The next part to work on, for "Próximo: …" on the list. Free parts come
 * first; locked parts still appear (as "Próximo: Forças e fraquezas"), since
 * they are the honest next step. `null` when everything is done.
 */
export function proximaParte(progresso: Progresso): Parte | null {
  for (const parte of [...ORDEM_GRATIS, ...ORDEM_PAGA]) {
    if (!parteCompleta(progresso, parte)) return parte;
  }
  return null;
}

/** Whether a part was started but not finished ("terminar …"). */
export function parteComecada(progresso: Progresso, parte: Parte): boolean {
  switch (parte) {
    case 'lean':
    case 'bmc':
    case 'persona':
    case 'swot':
      return progresso[parte].feitos > 0 && progresso[parte].feitos < progresso[parte].total;
    default:
      return false;
  }
}
