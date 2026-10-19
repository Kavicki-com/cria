import type { TranslationKey } from '@/core/i18n';
import type { Quadro } from '@/data';

import type { Parte } from '../negocios/progresso';

export type TextoCampo = 'bloco' | 'pergunta' | 'ajuda' | 'exemplo';

/**
 * Locale key of one piece of a field's copy: `quadros.<quadro>.<campo>.<texto>`.
 *
 * The ids come from `definicoes.ts` and every one has its four keys in the
 * locales (`quadros.test.ts` checks), so the cast only bridges what the type
 * system cannot follow through a runtime id.
 */
export function chaveCampo(quadro: Quadro, campo: string, texto: TextoCampo): TranslationKey {
  return `quadros.${quadro}.${campo}.${texto}` as TranslationKey;
}

export const PARTE_DO_QUADRO: Record<Quadro, Parte> = {
  lean: 'lean',
  bmc: 'bmc',
  persona: 'persona',
};

/** "Lean Canvas", "Business Model Canvas"… for "Revisão · Lean Canvas". */
export const NOME_TECNICO: Record<Quadro, TranslationKey> = {
  lean: 'partes.leanTecnico',
  bmc: 'partes.bmcTecnico',
  persona: 'partes.personaTecnico',
};
