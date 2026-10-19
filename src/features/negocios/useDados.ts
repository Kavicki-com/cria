import { useMemo, useSyncExternalStore } from 'react';

import {
  assinarMudancas,
  getNegocio,
  getNumeros,
  listNegocios,
  listRespostas,
  listSwot,
  listTarefas,
  versaoDosDados,
  type Negocio,
  type Numeros,
  type RespostasPorQuadro,
  type SwotItem,
  type Tarefa,
} from '@/data';

import { calcularProgresso, type Progresso } from './progresso';

/** Re-renders on every write, wherever it came from (see `src/data/mudancas.ts`). */
export function useVersaoDados(): number {
  return useSyncExternalStore(assinarMudancas, versaoDosDados);
}

export type NegocioComProgresso = { negocio: Negocio; progresso: Progresso };

/**
 * Every business with its progress, most recently touched first. Reads are
 * synchronous SQLite and a person has a handful of businesses, so re-reading
 * all of them on a write is cheap.
 */
export function useNegocios(): NegocioComProgresso[] {
  const versao = useVersaoDados();
  return useMemo(
    () =>
      listNegocios().map((negocio) => ({
        negocio,
        progresso: calcularProgresso({
          respostas: listRespostas(negocio.id),
          swot: listSwot(negocio.id),
          numeros: getNumeros(negocio.id),
          tarefas: listTarefas(negocio.id),
        }),
      })),
    // `versao` is the dependency on purpose: it bumps on every write.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [versao],
  );
}

export type DadosNegocio = {
  negocio: Negocio;
  respostas: RespostasPorQuadro;
  swot: SwotItem[];
  numeros: Numeros;
  tarefas: Tarefa[];
  progresso: Progresso;
};

/** Everything about one business, or null when it does not exist (deleted, bad link). */
export function useNegocio(id: string | undefined): DadosNegocio | null {
  const versao = useVersaoDados();
  return useMemo(() => {
    if (!id) return null;
    const negocio = getNegocio(id);
    if (!negocio) return null;
    const respostas = listRespostas(id);
    const swot = listSwot(id);
    const numeros = getNumeros(id);
    const tarefas = listTarefas(id);
    return {
      negocio,
      respostas,
      swot,
      numeros,
      tarefas,
      progresso: calcularProgresso({ respostas, swot, numeros, tarefas }),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, versao]);
}
