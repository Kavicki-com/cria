import { useMemo } from 'react';

import { useUnidade } from '../equilibrio/useUnidade';
import type { DadosNegocio } from '../negocios/useDados';
import { analisar, type Analise } from './analisar';

/** The analysis of one business, recomputed when its data or its unit change. */
export function useAnalise(dados: DadosNegocio): Analise {
  const unidade = useUnidade(dados.numeros);
  return useMemo(
    () =>
      analisar({
        negocio: dados.negocio,
        respostas: dados.respostas,
        swot: dados.swot,
        numeros: dados.numeros,
        tarefas: dados.tarefas,
        unidade,
      }),
    [dados, unidade],
  );
}
