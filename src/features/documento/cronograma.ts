import type { Tarefa } from '@/data/types';

import { diaDoIso } from '../planoAcao/datas';

/**
 * The action plan's timeline (design PDF-8-plano): the next three months,
 * four columns each (days 1–7, 8–15, 16–23, 24–end). A task's bar runs from
 * when it was created to its day, clamped to the window. Pure.
 */

export const MESES_JANELA = 3;
export const COLUNAS_POR_MES = 4;
export const TOTAL_COLUNAS = MESES_JANELA * COLUNAS_POR_MES;

/** 0-based column of a day inside the window starting at `inicio`, or null if outside. */
export function colunaDoDia(data: Date, inicio: Date): number | null {
  const meses =
    (data.getFullYear() - inicio.getFullYear()) * 12 + data.getMonth() - inicio.getMonth();
  if (meses < 0 || meses >= MESES_JANELA) return null;
  const dia = data.getDate();
  const semana = dia <= 7 ? 0 : dia <= 15 ? 1 : dia <= 23 ? 2 : 3;
  return meses * COLUNAS_POR_MES + semana;
}

export type Barra =
  | {
      tarefa: Tarefa;
      /** 1-based grid columns (the task name is column 1, so bars start at 2). */
      de: number;
      ate: number;
    }
  | {
      tarefa: Tarefa;
      de: null;
      ate: null;
    };

export function barras(tarefas: readonly Tarefa[], hoje: number): Barra[] {
  const inicio = new Date(hoje);
  inicio.setDate(1);
  inicio.setHours(0, 0, 0, 0);
  const fim = new Date(inicio);
  fim.setMonth(fim.getMonth() + MESES_JANELA);

  return [...tarefas]
    .sort((a, b) => (a.data ?? '9999').localeCompare(b.data ?? '9999') || a.ordem - b.ordem)
    .map((tarefa) => {
      const dia = diaDoIso(tarefa.data);
      if (!dia) return { tarefa, de: null, ate: null };
      const alvo = dia < inicio ? inicio : dia >= fim ? new Date(fim.getTime() - 86_400_000) : dia;
      const criado = new Date(Math.max(tarefa.criadoEm, inicio.getTime()));
      const fimCol = colunaDoDia(alvo, inicio) ?? TOTAL_COLUNAS - 1;
      const iniCol = Math.min(colunaDoDia(criado < alvo ? criado : alvo, inicio) ?? 0, fimCol);
      return { tarefa, de: iniCol + 2, ate: fimCol + 3 };
    });
}
