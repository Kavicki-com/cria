import { getDatabase, novoId } from './db';
import { notificarMudanca } from './mudancas';
import { tocarNegocio } from './negociosRepository';
import type { Tarefa, TarefaInput } from './types';

/** Tasks of the action plan. */

type TarefaRow = {
  id: string;
  negocio_id: string;
  nome: string;
  data: string | null;
  lembrete: number;
  notificacao_id: string | null;
  feita: number;
  origem_regra: string | null;
  ordem: number;
  criado_em: number;
};

function toTarefa(row: TarefaRow): Tarefa {
  return {
    id: row.id,
    negocioId: row.negocio_id,
    nome: row.nome,
    data: row.data,
    lembrete: row.lembrete === 1,
    notificacaoId: row.notificacao_id,
    feita: row.feita === 1,
    origemRegra: row.origem_regra,
    ordem: row.ordem,
    criadoEm: row.criado_em,
  };
}

/** Tasks of one business: pending first, then by the order they were added. */
export function listTarefas(negocioId: string): Tarefa[] {
  const db = getDatabase();
  if (!db) return [];
  return db
    .getAllSync<TarefaRow>(
      'SELECT * FROM tarefas WHERE negocio_id = ? ORDER BY feita, ordem',
      negocioId,
    )
    .map(toTarefa);
}

/** Every task with a reminder that is not done yet, across businesses. */
export function listTarefasComLembrete(): Tarefa[] {
  const db = getDatabase();
  if (!db) return [];
  return db
    .getAllSync<TarefaRow>(
      'SELECT * FROM tarefas WHERE lembrete = 1 AND feita = 0 AND data IS NOT NULL',
    )
    .map(toTarefa);
}

/**
 * Adds a task and returns its id. A task suggested by an analysis rule is
 * added at most once per business: a second call with the same `origemRegra`
 * returns the existing id.
 */
export function criarTarefa(negocioId: string, input: TarefaInput): string | null {
  const db = getDatabase();
  const nome = input.nome.trim();
  if (!db || !nome) return null;

  let id: string | null = null;
  db.withTransactionSync(() => {
    if (input.origemRegra) {
      const existente = db.getFirstSync<{ id: string }>(
        'SELECT id FROM tarefas WHERE negocio_id = ? AND origem_regra = ?',
        negocioId,
        input.origemRegra,
      );
      if (existente) {
        id = existente.id;
        return;
      }
    }
    const ultima =
      db.getFirstSync<{ ordem: number | null }>(
        'SELECT MAX(ordem) AS ordem FROM tarefas WHERE negocio_id = ?',
        negocioId,
      )?.ordem ?? -1;
    id = novoId();
    db.runSync(
      `INSERT INTO tarefas (id, negocio_id, nome, data, lembrete, feita, origem_regra, ordem, criado_em)
       VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)`,
      id,
      negocioId,
      nome,
      input.data ?? null,
      input.lembrete ? 1 : 0,
      input.origemRegra ?? null,
      ultima + 1,
      Date.now(),
    );
    tocarNegocio(negocioId);
  });
  notificarMudanca();
  return id;
}

export type TarefaPatch = Partial<
  Pick<Tarefa, 'nome' | 'data' | 'lembrete' | 'feita' | 'notificacaoId'>
>;

export function atualizarTarefa(id: string, patch: TarefaPatch): void {
  const db = getDatabase();
  if (!db) return;
  const atual = db.getFirstSync<TarefaRow>('SELECT * FROM tarefas WHERE id = ?', id);
  if (!atual) return;
  const t = { ...toTarefa(atual), ...patch };

  db.withTransactionSync(() => {
    db.runSync(
      'UPDATE tarefas SET nome = ?, data = ?, lembrete = ?, feita = ?, notificacao_id = ? WHERE id = ?',
      t.nome.trim() || atual.nome,
      t.data,
      t.lembrete ? 1 : 0,
      t.feita ? 1 : 0,
      t.notificacaoId,
      id,
    );
    tocarNegocio(atual.negocio_id);
  });
  notificarMudanca();
}

export function getTarefa(id: string): Tarefa | null {
  const row = getDatabase()?.getFirstSync<TarefaRow>('SELECT * FROM tarefas WHERE id = ?', id);
  return row ? toTarefa(row) : null;
}

export function removerTarefa(id: string): void {
  const db = getDatabase();
  if (!db) return;
  const atual = db.getFirstSync<{ negocio_id: string }>(
    'SELECT negocio_id FROM tarefas WHERE id = ?',
    id,
  );
  if (!atual) return;
  db.withTransactionSync(() => {
    db.runSync('DELETE FROM tarefas WHERE id = ?', id);
    tocarNegocio(atual.negocio_id);
  });
  notificarMudanca();
}
