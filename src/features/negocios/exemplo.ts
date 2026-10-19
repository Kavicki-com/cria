import { t } from '@/core/i18n';
import { criarNegocio, salvarNumeros, salvarResposta } from '@/data';

/**
 * Dev only (Ajustes → Desenvolvimento): seeds the plan's fixture, "Lanches da
 * Vila" (§7), so the hub, the analysis and the PDF can be looked at without
 * typing nine answers first. The answers are the design's Revisao screen.
 *
 * Copy comes from the locales like any other user-facing text, even here, so
 * the example reads right in English and Spanish too.
 */
export function criarNegocioExemplo(): string | null {
  const id = criarNegocio({
    nome: t('boasVindas.docNome'),
    segmento: 'alimentacao',
    estagio: 'vendendo',
  });
  if (!id) return null;

  const lean = [
    'problema',
    'paraQuem',
    'diferencial',
    'solucao',
    'receitas',
    'custos',
    'metricas',
    'vantagem',
  ] as const;
  for (const campo of lean) {
    salvarResposta(id, 'lean', campo, t(`exemplo.lean.${campo}`));
  }
  salvarNumeros(id, {
    fixos: 624_000,
    custoUnitario: 1_200,
    preco: 3_200,
    unidadeSingular: t('exemplo.unidade'),
    maiorCusto: t('exemplo.maiorCusto'),
  });
  return id;
}
