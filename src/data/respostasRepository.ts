import { getDatabase } from './db';
import { notificarMudanca } from './mudancas';
import { tocarNegocio } from './negociosRepository';
import type { Quadro, Resposta, RespostasPorQuadro } from './types';

/** Text answers of the Lean Canvas, the BMC and the Persona. */

type RespostaRow = {
  quadro: Quadro;
  campo: string;
  texto: string;
  pulada: number;
  atualizado_em: number;
};

function vazias(): RespostasPorQuadro {
  return { lean: {}, bmc: {}, persona: {} };
}

/** Every answer of a business, keyed `quadro` → `campo`. */
export function listRespostas(negocioId: string): RespostasPorQuadro {
  const resultado = vazias();
  const db = getDatabase();
  if (!db) return resultado;

  const linhas = db.getAllSync<RespostaRow>(
    'SELECT quadro, campo, texto, pulada, atualizado_em FROM respostas WHERE negocio_id = ?',
    negocioId,
  );
  for (const linha of linhas) {
    const resposta: Resposta = {
      quadro: linha.quadro,
      campo: linha.campo,
      texto: linha.texto,
      pulada: linha.pulada === 1,
      atualizadoEm: linha.atualizado_em,
    };
    resultado[linha.quadro][linha.campo] = resposta;
  }
  return resultado;
}

/**
 * Saves an answer, clearing "pulada". An empty text removes the answer, so an
 * erased field counts as unanswered again rather than as answered-with-nothing.
 */
export function salvarResposta(
  negocioId: string,
  quadro: Quadro,
  campo: string,
  texto: string,
): void {
  const db = getDatabase();
  if (!db) return;
  const limpo = texto.trim();

  db.withTransactionSync(() => {
    if (limpo) {
      db.runSync(
        `INSERT INTO respostas (negocio_id, quadro, campo, texto, pulada, atualizado_em)
         VALUES (?, ?, ?, ?, 0, ?)
         ON CONFLICT (negocio_id, quadro, campo)
         DO UPDATE SET texto = excluded.texto, pulada = 0, atualizado_em = excluded.atualizado_em`,
        negocioId,
        quadro,
        campo,
        limpo,
        Date.now(),
      );
    } else {
      db.runSync(
        'DELETE FROM respostas WHERE negocio_id = ? AND quadro = ? AND campo = ?',
        negocioId,
        quadro,
        campo,
      );
    }
    tocarNegocio(negocioId);
  });
  notificarMudanca();
}

/** "Pular por enquanto": keeps whatever text there was and marks the field skipped. */
export function pularResposta(negocioId: string, quadro: Quadro, campo: string): void {
  const db = getDatabase();
  if (!db) return;

  db.withTransactionSync(() => {
    db.runSync(
      `INSERT INTO respostas (negocio_id, quadro, campo, texto, pulada, atualizado_em)
       VALUES (?, ?, ?, '', 1, ?)
       ON CONFLICT (negocio_id, quadro, campo)
       DO UPDATE SET pulada = 1, atualizado_em = excluded.atualizado_em`,
      negocioId,
      quadro,
      campo,
      Date.now(),
    );
    tocarNegocio(negocioId);
  });
  notificarMudanca();
}
