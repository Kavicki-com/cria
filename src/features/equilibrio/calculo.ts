import type { Numeros } from '@/data/types';

/**
 * Break-even arithmetic. All money in integer centavos (see data/types.ts).
 *
 * Pure: no React, no database. The analysis and the PDF read the same
 * numbers from here, so the app and the document can never disagree.
 */

/** The three numbers, all present and making sense: price above unit cost. */
export type NumerosValidos = {
  fixos: number;
  custoUnitario: number;
  preco: number;
  diasPorMes: number;
};

export type EstadoNumeros =
  | { tipo: 'incompleto' }
  /** "Assim não fecha a conta": price at or below the unit cost. */
  | { tipo: 'nao-fecha' }
  | { tipo: 'ok'; numeros: NumerosValidos };

export function avaliarNumeros(numeros: Numeros): EstadoNumeros {
  const { fixos, custoUnitario, preco } = numeros;
  if (fixos === null || custoUnitario === null || preco === null) return { tipo: 'incompleto' };
  if (fixos <= 0 || preco <= 0) return { tipo: 'incompleto' };
  if (preco <= custoUnitario) return { tipo: 'nao-fecha' };
  return {
    tipo: 'ok',
    numeros: { fixos, custoUnitario, preco, diasPorMes: Math.max(1, numeros.diasPorMes) },
  };
}

/** Units per month to cover the fixed costs, rounded up: you cannot sell 0.4 lanche. */
export function empate(fixos: number, custoUnitario: number, preco: number): number {
  return Math.ceil(fixos / (preco - custoUnitario));
}

export type Indicadores = {
  /** Price minus unit cost, centavos. */
  margemUnit: number;
  /** Margin over price, 0–100, one decimal. */
  margemPct: number;
  /** Units per month to break even. */
  empateMes: number;
  /** Units per working day, rounded up. */
  empateDia: number;
  /** Revenue at break-even, centavos. */
  faturamentoEmpate: number;
  /**
   * Extra units per month needed if the unit cost goes up R$ 1. Null when a
   * R$ 1 rise would put the cost at or above the price.
   */
  sensibilidadeCusto: number | null;
};

const UM_REAL = 100;

export function calcularIndicadores(n: NumerosValidos): Indicadores {
  const margemUnit = n.preco - n.custoUnitario;
  const empateMes = empate(n.fixos, n.custoUnitario, n.preco);
  const custoMais = n.custoUnitario + UM_REAL;
  return {
    margemUnit,
    margemPct: Math.round((margemUnit / n.preco) * 1000) / 10,
    empateMes,
    empateDia: Math.ceil(empateMes / n.diasPorMes),
    faturamentoEmpate: empateMes * n.preco,
    sensibilidadeCusto:
      custoMais < n.preco ? empate(n.fixos, custoMais, n.preco) - empateMes : null,
  };
}
