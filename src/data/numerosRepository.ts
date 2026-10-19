import { getDatabase } from './db';
import { notificarMudanca } from './mudancas';
import { tocarNegocio } from './negociosRepository';
import { NUMEROS_VAZIOS, type Numeros } from './types';

/** The break-even calculator's inputs: one row per business. */

type NumerosRow = {
  fixos_centavos: number | null;
  custo_unitario_centavos: number | null;
  preco_centavos: number | null;
  dias_por_mes: number;
  unidade_singular: string | null;
  unidade_plural: string | null;
  maior_custo: string | null;
};

export function getNumeros(negocioId: string): Numeros {
  const db = getDatabase();
  if (!db) return NUMEROS_VAZIOS;
  const row = db.getFirstSync<NumerosRow>('SELECT * FROM numeros WHERE negocio_id = ?', negocioId);
  if (!row) return NUMEROS_VAZIOS;
  return {
    fixos: row.fixos_centavos,
    custoUnitario: row.custo_unitario_centavos,
    preco: row.preco_centavos,
    diasPorMes: row.dias_por_mes,
    unidadeSingular: row.unidade_singular,
    unidadePlural: row.unidade_plural,
    maiorCusto: row.maior_custo,
  };
}

/** Merges `patch` into the business's numbers (the row is created on first save). */
export function salvarNumeros(negocioId: string, patch: Partial<Numeros>): void {
  const db = getDatabase();
  if (!db) return;

  db.withTransactionSync(() => {
    const atual = { ...getNumeros(negocioId), ...patch };
    const texto = (valor: string | null) => (valor?.trim() ? valor.trim() : null);
    db.runSync(
      `INSERT INTO numeros (negocio_id, fixos_centavos, custo_unitario_centavos, preco_centavos,
                            dias_por_mes, unidade_singular, unidade_plural, maior_custo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT (negocio_id) DO UPDATE SET
         fixos_centavos = excluded.fixos_centavos,
         custo_unitario_centavos = excluded.custo_unitario_centavos,
         preco_centavos = excluded.preco_centavos,
         dias_por_mes = excluded.dias_por_mes,
         unidade_singular = excluded.unidade_singular,
         unidade_plural = excluded.unidade_plural,
         maior_custo = excluded.maior_custo`,
      negocioId,
      atual.fixos,
      atual.custoUnitario,
      atual.preco,
      atual.diasPorMes,
      texto(atual.unidadeSingular),
      texto(atual.unidadePlural),
      texto(atual.maiorCusto),
    );
    tocarNegocio(negocioId);
  });
  notificarMudanca();
}
