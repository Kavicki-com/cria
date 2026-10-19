import type { NumerosValidos } from '../equilibrio/calculo';
import { esc } from './html';

/**
 * The break-even chart of the numbers page (design PDF-7-numeros): revenue
 * and total cost against units sold, crossing at break-even, with the profit
 * and loss areas shaded. Drawn as SVG markup from the numbers — no chart
 * library in the print WebView.
 */

/** Rounds up to 1, 2 or 5 times a power of ten, for tidy axis ends. */
export function tetoRedondo(valor: number): number {
  if (valor <= 0) return 1;
  const ordem = 10 ** Math.floor(Math.log10(valor));
  for (const base of [1, 2, 5, 10]) {
    if (base * ordem >= valor) return base * ordem;
  }
  return 10 * ordem;
}

export type TextosGrafico = {
  lucro: string;
  prejuizo: string;
  receita: string;
  custoTotal: string;
  /** "312 lanches · R$ 9.984" */
  ponto: string;
  /** Formats a money axis tick (centavos): "4 mil". */
  eixoY: (centavos: number) => string;
  descricao: string;
};

const L = 60;
const R = 630;
const T = 20;
const B = 300;

export function graficoEquilibrio(
  n: NumerosValidos,
  empateMes: number,
  textos: TextosGrafico,
): string {
  const xMax = tetoRedondo(empateMes * 1.6);
  const yMax = tetoRedondo(Math.max(xMax * n.preco, n.fixos + xMax * n.custoUnitario));
  const x = (v: number) => L + (v / xMax) * (R - L);
  const y = (c: number) => B - (c / yMax) * (B - T);

  const receitaFim = { x: x(xMax), y: y(xMax * n.preco) };
  const custoIni = { x: x(0), y: y(n.fixos) };
  const custoFim = { x: x(xMax), y: y(n.fixos + xMax * n.custoUnitario) };
  const ponto = { x: x(empateMes), y: y(empateMes * n.preco) };

  const ticksY = [0, 0.25, 0.5, 0.75, 1].map((f) => f * yMax);
  const ticksX = [0, 0.2, 0.4, 0.6, 0.8, 1].map((f) => Math.round(f * xMax));
  const f = (v: number) => v.toFixed(1);

  return `<svg width="650" height="270" viewBox="0 0 650 340" role="img" aria-label="${esc(textos.descricao)}">
  <g stroke="#E7E1D7" stroke-width="1">${ticksY
    .slice(1)
    .map((v) => `<line x1="${L}" y1="${f(y(v))}" x2="${R}" y2="${f(y(v))}"/>`)
    .join('')}</g>
  <line x1="${L}" y1="${B}" x2="${R}" y2="${B}" stroke="#18212E" stroke-width="1.5"/>
  <g font-family="Roboto, sans-serif" font-size="14" fill="#545F6E" text-anchor="end">${ticksY
    .map((v) => `<text x="52" y="${f(y(v) + 4)}">${esc(textos.eixoY(v))}</text>`)
    .join('')}</g>
  <g font-family="Roboto, sans-serif" font-size="14" fill="#545F6E" text-anchor="middle">${ticksX
    .map((v) => `<text x="${f(x(v))}" y="322">${v}</text>`)
    .join('')}</g>
  <path d="M${f(ponto.x)} ${f(ponto.y)} L${f(receitaFim.x)} ${f(receitaFim.y)} L${f(custoFim.x)} ${f(custoFim.y)} Z" fill="#E4ECF7"/>
  <path d="M${L} ${B} L${f(ponto.x)} ${f(ponto.y)} L${f(custoIni.x)} ${f(custoIni.y)} Z" fill="#F7E3DE"/>
  <line x1="${L}" y1="${f(custoIni.y)}" x2="${R}" y2="${f(custoIni.y)}" stroke="#8A93A0" stroke-width="1.5" stroke-dasharray="5 5"/>
  <line x1="${f(custoIni.x)}" y1="${f(custoIni.y)}" x2="${f(custoFim.x)}" y2="${f(custoFim.y)}" stroke="#C9475A" stroke-width="3"/>
  <line x1="${L}" y1="${B}" x2="${f(receitaFim.x)}" y2="${f(receitaFim.y)}" stroke="#1F4F8F" stroke-width="3"/>
  <circle cx="${f(ponto.x)}" cy="${f(ponto.y)}" r="7" fill="#FFFDF9" stroke="#1F4F8F" stroke-width="3"/>
  <text x="${f(ponto.x - 15)}" y="${f(ponto.y - 13)}" font-family="Roboto, sans-serif" font-size="15" font-weight="700" fill="#18212E" text-anchor="end">${esc(textos.ponto)}</text>
  <text x="${f((ponto.x + R) / 2 + 20)}" y="${f((receitaFim.y + custoFim.y) / 2 + 4)}" font-family="Roboto, sans-serif" font-size="14" font-weight="700" fill="#173B6C" text-anchor="middle">${esc(textos.lucro)}</text>
  <text x="${f((L + ponto.x) / 2 - 10)}" y="${f((B + custoIni.y) / 2 + 8)}" font-family="Roboto, sans-serif" font-size="14" font-weight="700" fill="#4B2E83" text-anchor="middle">${esc(textos.prejuizo)}</text>
  <text x="${R - 4}" y="${f(Math.max(14, receitaFim.y - 6))}" font-family="Roboto, sans-serif" font-size="13" font-weight="700" fill="#1F4F8F" text-anchor="end">${esc(textos.receita)}</text>
  <text x="${R - 4}" y="${f(custoFim.y + 18)}" font-family="Roboto, sans-serif" font-size="13" font-weight="700" fill="#A3364A" text-anchor="end">${esc(textos.custoTotal)}</text>
</svg>`;
}
