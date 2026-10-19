import { getDatabase, novoId } from './db';
import { notificarMudanca } from './mudancas';
import { tocarNegocio } from './negociosRepository';
import type { ParteSwot, SwotItem } from './types';

/** SWOT items: a short list per part. */

type SwotRow = { id: string; parte: ParteSwot; texto: string; ordem: number };

/** Every item of a business, in part order and then in the order added. */
export function listSwot(negocioId: string): SwotItem[] {
  const db = getDatabase();
  if (!db) return [];
  return db.getAllSync<SwotRow>(
    'SELECT id, parte, texto, ordem FROM swot_itens WHERE negocio_id = ? ORDER BY parte, ordem',
    negocioId,
  );
}

export function adicionarItemSwot(negocioId: string, parte: ParteSwot, texto: string): void {
  const db = getDatabase();
  const limpo = texto.trim();
  if (!db || !limpo) return;

  db.withTransactionSync(() => {
    const ultima =
      db.getFirstSync<{ ordem: number | null }>(
        'SELECT MAX(ordem) AS ordem FROM swot_itens WHERE negocio_id = ? AND parte = ?',
        negocioId,
        parte,
      )?.ordem ?? -1;
    db.runSync(
      'INSERT INTO swot_itens (id, negocio_id, parte, texto, ordem) VALUES (?, ?, ?, ?, ?)',
      novoId(),
      negocioId,
      parte,
      limpo,
      ultima + 1,
    );
    tocarNegocio(negocioId);
  });
  notificarMudanca();
}

/** Edits an item's text; an emptied item is removed. */
export function editarItemSwot(negocioId: string, id: string, texto: string): void {
  const db = getDatabase();
  if (!db) return;
  const limpo = texto.trim();

  db.withTransactionSync(() => {
    if (limpo) db.runSync('UPDATE swot_itens SET texto = ? WHERE id = ?', limpo, id);
    else db.runSync('DELETE FROM swot_itens WHERE id = ?', id);
    tocarNegocio(negocioId);
  });
  notificarMudanca();
}

export function removerItemSwot(negocioId: string, id: string): void {
  const db = getDatabase();
  if (!db) return;
  db.withTransactionSync(() => {
    db.runSync('DELETE FROM swot_itens WHERE id = ?', id);
    tocarNegocio(negocioId);
  });
  notificarMudanca();
}
