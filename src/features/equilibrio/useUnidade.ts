import { useTranslation } from '@/core/i18n/useTranslation';
import type { Numeros } from '@/data';

import { resolverUnidade, type Unidade } from './unidade';

/** The business's unit in the current language (see `resolverUnidade`). */
export function useUnidade(numeros: Pick<Numeros, 'unidadeSingular' | 'unidadePlural'>): Unidade {
  const { t, locale } = useTranslation();
  return resolverUnidade(
    numeros.unidadeSingular,
    numeros.unidadePlural,
    { singular: t('equilibrio.unidadePadrao'), plural: t('equilibrio.unidadePadraoPlural') },
    locale === 'pt-BR',
  );
}
