import { empate, type NumerosValidos } from '../equilibrio/calculo';

/**
 * Scenarios and "e se…" for the analysis and the PDF's numbers page (§7).
 * Integer centavos throughout. Pure: `node --test` runs it.
 */

/**
 * Rounds a quantity of units to a step that reads naturally for its size:
 * 50s from 200 up ("250, 400, 500"), 10s from 40, 5s from 10, else 1s. A
 * fixed step of 50 would turn the 0.8× scenario of a 40-a-month business
 * into 0.
 */
export function arredondarVendas(vendas: number): number {
  const passo = vendas >= 200 ? 50 : vendas >= 40 ? 10 : vendas >= 10 ? 5 : 1;
  return Math.max(1, Math.round(vendas / passo) * passo);
}

/**
 * Rounds a change in money to a "round" value: the nearest of 1, 2 or 5
 * times a power of ten (in centavos). R$ 1,92 → R$ 2; R$ 1,80 → R$ 2;
 * R$ 936 → R$ 1.000. Gives the "e se…" values the plan asks for (34, 14,
 * +1.000) from 6% and 15%, and stays sensible for any size.
 */
export function arredondarRedondo(centavos: number): number {
  if (centavos <= 0) return 0;
  const ordem = 10 ** Math.floor(Math.log10(centavos));
  let melhor = ordem;
  for (const base of [1, 2, 5, 10]) {
    const candidato = base * ordem;
    if (Math.abs(candidato - centavos) < Math.abs(melhor - centavos)) melhor = candidato;
  }
  return melhor;
}

export type Cenario = {
  vendas: number;
  /** Revenue, centavos. */
  faturamento: number;
  /** Revenue minus all costs, centavos (negative is a loss). */
  resultado: number;
};

export const MULTIPLICADORES_CENARIO = [0.8, 1.3, 1.6] as const;

export function cenarios(n: NumerosValidos, empateMes: number): Cenario[] {
  const margem = n.preco - n.custoUnitario;
  const vistos = new Set<number>();
  const lista: Cenario[] = [];
  for (const m of MULTIPLICADORES_CENARIO) {
    const vendas = arredondarVendas(empateMes * m);
    if (vistos.has(vendas) || vendas === empateMes) continue;
    vistos.add(vendas);
    lista.push({ vendas, faturamento: vendas * n.preco, resultado: vendas * margem - n.fixos });
  }
  return lista;
}

export type ChaveESe = 'preco' | 'custo' | 'fixos';

export type ESe = {
  chave: ChaveESe;
  /** The changed value (new price, new unit cost, or the added fixed cost), centavos. */
  valor: number;
  delta: number;
  /** Break-even with the change, units per month; null if the price no longer covers the cost. */
  novoEmpate: number | null;
};

/** Price +~6%, unit cost +~15%, fixed costs +~15%, each rounded (see `arredondarRedondo`). */
export function eSe(n: NumerosValidos): ESe[] {
  const dPreco = arredondarRedondo(n.preco * 0.06);
  const dCusto = arredondarRedondo(n.custoUnitario * 0.15);
  const dFixos = arredondarRedondo(n.fixos * 0.15);
  const custo = n.custoUnitario + dCusto;
  return [
    {
      chave: 'preco',
      valor: n.preco + dPreco,
      delta: dPreco,
      novoEmpate: empate(n.fixos, n.custoUnitario, n.preco + dPreco),
    },
    {
      chave: 'custo',
      valor: custo,
      delta: dCusto,
      novoEmpate: custo < n.preco ? empate(n.fixos, custo, n.preco) : null,
    },
    {
      chave: 'fixos',
      valor: dFixos,
      delta: dFixos,
      novoEmpate: empate(n.fixos + dFixos, n.custoUnitario, n.preco),
    },
  ];
}

/** "Num turno de 8 h, um a cada 40 minutos": minutes per sale at the daily goal. */
export function minutosPorVenda(empateDia: number, horasDeTrabalho = 8): number {
  return Math.max(1, Math.round((horasDeTrabalho * 60) / empateDia));
}
