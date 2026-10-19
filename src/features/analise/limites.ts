import type { Segmento } from '@/data/types';

/**
 * Sales per day above which reaching break-even is a capacity question for a
 * small business in each segment — the threshold of the `empate_alto` rule.
 *
 * A judgement call, not data: roughly what one or two people can sell and
 * deliver in a working day. A snack bar can do 60 lanches; a salon, a dozen
 * appointments; a tutor, a handful of classes.
 */
export const LIMITE_EMPATE_DIA: Record<Segmento, number> = {
  alimentacao: 60,
  beleza: 12,
  comercio: 40,
  servicos: 8,
  moda: 15,
  saude: 10,
  educacao: 10,
  outro: 25,
};
