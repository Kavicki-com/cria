/**
 * The PDF's CSS. Light paper in both themes (the PDF is never dark), sizes
 * in CSS px at 96 dpi, which is how the design's A4 frames were drawn:
 * 794 × 1123 px portrait, 1123 × 794 px landscape.
 *
 * Fonts arrive as `@font-face` with data URIs (`fontesCss`): the print
 * WebView cannot see the fonts the app registered.
 */

/**
 * How the two landscape pages (Lean Canvas, BMC) are laid out.
 *
 * - `girada`: every page is A4 portrait and the landscape content is rotated
 *   90° inside it. Plain CSS transforms — works the same in Android's
 *   Chromium WebView and in iOS's WKWebView.
 * - `nomeada`: `@page paisagem { size: A4 landscape }`. Truly landscape
 *   pages, but named pages are not guaranteed in both print WebViews.
 *
 * `girada` is the default until the spike of plan §8 confirms `nomeada` on
 * both systems; switching is this one constant.
 */
export type OrientacaoPaisagem = 'girada' | 'nomeada';
export const ORIENTACAO_PAISAGEM: OrientacaoPaisagem = 'girada';

export function estilos(orientacao: OrientacaoPaisagem): string {
  const paisagem =
    orientacao === 'nomeada'
      ? `
  @page paisagem { size: A4 landscape; margin: 0; }
  section.pagina.paisagem { page: paisagem; width: 1123px; height: 794px; }
  section.pagina.paisagem > .giro { width: 1123px; height: 794px; }`
      : `
  section.pagina.paisagem > .giro {
    position: absolute; top: 0; left: 0; width: 1123px; height: 794px;
    transform-origin: top left; transform: translateY(1123px) rotate(-90deg);
  }`;

  return `
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #FFFDF9; }
  body {
    color: #18212E; font-family: 'Roboto', 'Helvetica Neue', Arial, sans-serif;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  .poppins { font-family: 'Poppins', 'Helvetica Neue', Arial, sans-serif; font-weight: 600; }
  section.pagina {
    position: relative; width: 794px; height: 1123px; overflow: hidden;
    background: #FFFDF9; page-break-after: always; break-after: page;
  }
  section.pagina:last-child { page-break-after: auto; break-after: auto; }
  .conteudo { display: flex; flex-direction: column; height: 100%; padding: 48px 72px 44px; }
  .topo { display: flex; justify-content: space-between; font-size: 12px; color: #545F6E; padding-bottom: 12px; border-bottom: 1px solid #E7E1D7; }
  .topo b { color: #18212E; }
  .rotulo { font-size: 13px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #1F4F8F; }
  h1, h2, p { margin: 0; }
  h1 { font-family: 'Poppins', 'Helvetica Neue', Arial, sans-serif; font-weight: 600; letter-spacing: -0.015em; }
  h2 { font-family: 'Poppins', 'Helvetica Neue', Arial, sans-serif; font-weight: 600; }
  .rodape { margin-top: auto; display: flex; justify-content: space-between; font-size: 12px; color: #545F6E; }
  .vazio { color: #8A93A0; }
  .clamp { display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden; }
  .quebra { white-space: pre-line; overflow-wrap: anywhere; }
  .tiles { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
  .tile { border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 4px; background: #F4F1EB; }
  .tile.azul { background: #E4ECF7; }
  .tile.goiaba { background: #FCE3E5; }
  .tile .r { font-size: 12px; color: #3A4555; }
  .tile.azul .r, .tile.azul .d { color: #2A3F5C; }
  .tile.goiaba .r, .tile.goiaba .d { color: #8A2433; }
  .tile .v { font-family: 'Poppins', 'Helvetica Neue', Arial, sans-serif; font-weight: 600; font-size: 26px; }
  .tile.azul .v { color: #1F4F8F; }
  .tile.goiaba .v { color: #6E1A27; }
  .tile .d { font-size: 12px; line-height: 1.4; color: #3A4555; }
  .canvas { flex: 1; display: grid; grid-template-columns: repeat(10, minmax(0, 1fr)); grid-template-rows: 1fr 1fr 0.8fr; gap: 6px; min-height: 0; }
  .bloco { border: 1px solid #D6CFC3; border-radius: 8px; padding: 14px; display: flex; flex-direction: column; gap: 8px; background: #FFFFFF; overflow: hidden; min-height: 0; }
  .bloco.destaque { border: 2px solid #1F4F8F; background: #E4ECF7; }
  .bloco.pendente { border: 1px dashed #B9B0A1; background: #FFFDF9; }
  .bloco .t { font-size: 12px; font-weight: 700; color: #1F4F8F; }
  .bloco .x { font-size: 13px; line-height: 1.45; }
  .bloco.destaque .x { font-family: 'Poppins', 'Helvetica Neue', Arial, sans-serif; font-weight: 600; font-size: 19px; line-height: 1.25; }
  .bloco.pendente .x { color: #545F6E; font-style: italic; }
  ${paisagem}
  `;
}
