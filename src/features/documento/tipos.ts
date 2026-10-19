import type { Negocio, Numeros, RespostasPorQuadro, SwotItem, Tarefa } from '@/data/types';

import type { Analise } from '../analise/analisar';
import type { Unidade } from '../equilibrio/unidade';
import type { Progresso } from '../negocios/progresso';
import type { Ilustracao } from '../quadros/definicoes';

/**
 * Everything the PDF needs, gathered by the screen and handed to the pure
 * templates. `t` is passed in (not imported) so the templates run under
 * `node --test` with the locale JSON.
 */
export type Traduzir = (chave: string, params?: Record<string, string | number>) => string;

export type DadosDocumento = {
  negocio: Negocio;
  respostas: RespostasPorQuadro;
  swot: readonly SwotItem[];
  numeros: Numeros;
  tarefas: readonly Tarefa[];
  analise: Analise;
  progresso: Progresso;
  unidade: Unidade;
  ilustracao: Ilustracao;
  /** "Today" for the date on the pages and the action plan's months (epoch ms). */
  hoje: number;
  locale: string;
};
