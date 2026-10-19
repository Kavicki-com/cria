/**
 * The free tier, in one place (like Pendurô's `LIMITE_CLIENTES_GRATIS`).
 *
 * Free: the Lean Canvas, the break-even calculator and a preview of the
 * analysis showing one point of attention. Everything else — BMC, SWOT,
 * Persona, action plan, the full analysis and the PDF — comes with the
 * one-time unlock, for every business.
 */
import type { Parte } from './negocios/progresso';

export const PARTES_GRATIS: readonly Parte[] = ['lean', 'equilibrio'];

/** How many findings the free analysis preview shows in full. */
export const INSIGHTS_PREVIA = 1;

export function parteGratis(parte: Parte): boolean {
  return PARTES_GRATIS.includes(parte);
}
