import type { TranslationKey } from '@/core/i18n';
import type { ColorTokens } from '@/core/theme';
import type { ParteSwot } from '@/data';

export type TextoParte =
  'nome' | 'tipo' | 'curto' | 'pergunta' | 'ajuda' | 'placeholder' | 'exemplo';

/** Locale key of a SWOT part's copy: `swot.<parte>.<texto>`. */
export function chaveParte(parte: ParteSwot, texto: TextoParte): TranslationKey {
  return `swot.${parte}.${texto}` as TranslationKey;
}

/** Tag colours per part, from the design (Swot / Revisao-swot). */
export const COR_PARTE: Record<ParteSwot, { fundo: keyof ColorTokens; texto: keyof ColorTokens }> =
  {
    forcas: { fundo: 'primarySoft', texto: 'primaryPressed' },
    fraquezas: { fundo: 'surfaceElevated', texto: 'textBody' },
    oportunidades: { fundo: 'accentSoft', texto: 'onAccentSoft' },
    ameacas: { fundo: 'lilasSoft', texto: 'onLilasSoft' },
  };
