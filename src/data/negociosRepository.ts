import { getDatabase, novoId } from './db';
import { notificarMudanca } from './mudancas';
import type { Estagio, Negocio, NegocioInput, Segmento } from './types';

/**
 * Reads and writes over the `negocios` table.
 *
 * Imports come straight from `./db` and `./types`, never from `./index` —
 * a repository that reached back through the barrel would close a require
 * cycle, and Metro only warns about those at runtime (invariant 2).
 */

type NegocioRow = {
  id: string;
  nome: string;
  segmento: Segmento;
  estagio: Estagio;
  criado_em: number;
  atualizado_em: number;
};

function toNegocio(row: NegocioRow): Negocio {
  return {
    id: row.id,
    nome: row.nome,
    segmento: row.segmento,
    estagio: row.estagio,
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,
  };
}

/** Every business, the one touched most recently first. */
export function listNegocios(): Negocio[] {
  const db = getDatabase();
  if (!db) return [];
  return db
    .getAllSync<NegocioRow>('SELECT * FROM negocios ORDER BY atualizado_em DESC')
    .map(toNegocio);
}

export function getNegocio(id: string): Negocio | null {
  const db = getDatabase();
  if (!db) return null;
  const row = db.getFirstSync<NegocioRow>('SELECT * FROM negocios WHERE id = ?', id);
  return row ? toNegocio(row) : null;
}

/** Creates a business and returns its id, or null where nothing can be stored. */
export function criarNegocio(input: NegocioInput): string | null {
  const db = getDatabase();
  if (!db) return null;
  const id = novoId();
  const agora = Date.now();
  db.runSync(
    `INSERT INTO negocios (id, nome, segmento, estagio, criado_em, atualizado_em)
     VALUES (?, ?, ?, ?, ?, ?)`,
    id,
    input.nome.trim(),
    input.segmento,
    input.estagio,
    agora,
    agora,
  );
  notificarMudanca();
  return id;
}

export function atualizarNegocio(id: string, input: NegocioInput): void {
  const db = getDatabase();
  if (!db) return;
  db.runSync(
    'UPDATE negocios SET nome = ?, segmento = ?, estagio = ?, atualizado_em = ? WHERE id = ?',
    input.nome.trim(),
    input.segmento,
    input.estagio,
    Date.now(),
    id,
  );
  notificarMudanca();
}

/** Deletes a business; its answers, SWOT, numbers and tasks go with it (CASCADE). */
export function excluirNegocio(id: string): void {
  const db = getDatabase();
  if (!db) return;
  db.runSync('DELETE FROM negocios WHERE id = ?', id);
  notificarMudanca();
}

/**
 * Bumps `atualizado_em` so the business rises to the top of the list. Called
 * by the other repositories inside their own write; does not notify.
 */
export function tocarNegocio(id: string): void {
  getDatabase()?.runSync('UPDATE negocios SET atualizado_em = ? WHERE id = ?', Date.now(), id);
}
