import type { TranslationKey } from '@/core/i18n';
import type { TranslateFn } from '@/core/i18n/useTranslation';

import { formatarMoedaCurta } from '../dinheiro';
import type { Achado, Cruzamento, ItemConquistar, Parametros, Passo } from './analisar';

/**
 * Turns the engine's ids and parameters into sentences, in the current
 * language. The engine stays pure; this is the only place that knows the
 * locale keys `analise.regras.<id>.*`.
 */

function chave(regra: string, texto: string): TranslationKey {
  return `analise.regras.${regra}.${texto}` as TranslationKey;
}

/** "62,5" in pt/es, "62.5" in en. */
export function formatarPct(pct: number, locale: string): string {
  const texto = Number.isInteger(pct) ? String(pct) : pct.toFixed(1);
  return locale === 'en' ? texto : texto.replace('.', ',');
}

function capitalizar(texto: string): string {
  return texto ? texto[0]!.toUpperCase() + texto.slice(1) : texto;
}

function parametros(t: TranslateFn, locale: string, params: Parametros): Parametros {
  const p: Parametros = { ...params, um: formatarMoedaCurta(100, t('common.moeda')) };
  if (typeof params.pct === 'number') p.pct = formatarPct(params.pct, locale);
  return p;
}

export function textoAchado(
  t: TranslateFn,
  locale: string,
  achado: Achado,
): { titulo: string; texto: string } {
  const p = parametros(t, locale, achado.params);
  let texto = chave(achado.regra, 'texto');
  if (achado.regra === 'canais_vazios' && !achado.params.empateDia)
    texto = chave(achado.regra, 'textoSemMeta');
  if (achado.regra === 'proposta_vaga' && !achado.params.proposta)
    texto = chave(achado.regra, 'textoVazio');
  return {
    titulo: t(chave(achado.regra, 'titulo'), {
      ...p,
      maiorCusto: capitalizar(String(achado.params.maiorCusto ?? '')),
    }),
    texto: t(texto, p),
  };
}

/** The task a step adds to the plan, for steps whose destination is `tarefa`. */
export function tarefaDoPasso(t: TranslateFn, passo: Passo): string {
  return t(chave(passo.regra, 'tarefa'), passo.params);
}

export function textoPasso(t: TranslateFn, locale: string, passo: Passo): string {
  const p = parametros(t, locale, passo.params);
  return t(chave(passo.regra, 'passo'), {
    ...p,
    tarefa: passo.destino.tipo === 'tarefa' ? tarefaDoPasso(t, passo) : '',
  });
}

export function textoCruzamento(t: TranslateFn, c: Cruzamento): { rotulo: string; texto: string } {
  return {
    rotulo: t(`analise.cruzamentos.${c.tipo}.rotulo` as TranslationKey),
    texto: t(`analise.cruzamentos.${c.tipo}.texto` as TranslationKey, c.params),
  };
}

export function rotuloConquistar(t: TranslateFn, item: ItemConquistar, nome: string): string {
  return t(`analise.conquistar.${item.chave}` as TranslationKey, { nome });
}

/** "3 pontos de atenção" / "1 ponto de atenção". */
export function contarAtencao(t: TranslateFn, n: number): string {
  return n === 1 ? t('analise.umPontoAtencao') : t('analise.pontosAtencao', { n });
}

export function contarPassos(t: TranslateFn, n: number): string {
  return n === 1 ? t('analise.umPasso') : t('analise.passosN', { n });
}
