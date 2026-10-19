import { estilos, ORIENTACAO_PAISAGEM, type OrientacaoPaisagem } from './estilos';
import { esc } from './html';
import { criarCtx, PAGINAS } from './paginas';
import type { DadosDocumento, Traduzir } from './tipos';

/**
 * The whole PDF as one HTML string (plan §8): nine `section.pagina`, A4,
 * paper-coloured, with the fonts embedded. Pure — the screen gathers the
 * data, this only writes markup — so `montar.test.ts` checks it without a
 * print WebView.
 */
export function montarDocumento(
  dados: DadosDocumento,
  t: Traduzir,
  fontesCss: string,
  orientacao: OrientacaoPaisagem = ORIENTACAO_PAISAGEM,
): string {
  const c = criarCtx(dados, t);
  const titulo = `${t('documento.planoDeNegocio')} · ${dados.negocio.nome}`;
  return `<!doctype html>
<html lang="${esc(dados.locale)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=794">
<title>${esc(titulo)}</title>
<style>${fontesCss}
${estilos(orientacao)}</style>
</head>
<body>
${PAGINAS.map((pagina) => pagina(c)).join('\n')}
</body>
</html>`;
}

export const TOTAL_PAGINAS = PAGINAS.length;
