import type { TranslationKey } from '@/core/i18n';
import type { Estagio, Segmento } from '@/data';

import type { Parte } from './progresso';

/** Locale keys for the enums the database stores. */

export const ROTULO_SEGMENTO: Record<Segmento, TranslationKey> = {
  alimentacao: 'segmentos.alimentacao',
  beleza: 'segmentos.beleza',
  comercio: 'segmentos.comercio',
  servicos: 'segmentos.servicos',
  moda: 'segmentos.moda',
  saude: 'segmentos.saude',
  educacao: 'segmentos.educacao',
  outro: 'segmentos.outro',
};

export const ROTULO_ESTAGIO: Record<Estagio, TranslationKey> = {
  ideia: 'estagios.ideia',
  vendendo: 'estagios.vendendo',
};

export const DESCRICAO_ESTAGIO: Record<Estagio, TranslationKey> = {
  ideia: 'estagios.ideiaDesc',
  vendendo: 'estagios.vendendoDesc',
};

export const ROTULO_PARTE: Record<Parte, TranslationKey> = {
  lean: 'partes.lean',
  equilibrio: 'partes.equilibrio',
  bmc: 'partes.bmc',
  swot: 'partes.swot',
  persona: 'partes.persona',
  plano: 'partes.plano',
};
