import type { ParteSwot } from '@/data/types';

import type { TranslateFn } from '@/core/i18n/useTranslation';

import type { Achado } from '../analise/analisar';
import {
  formatarPct,
  rotuloConquistar,
  textoAchado,
  textoCruzamento,
  textoPassoDocumento,
} from '../analise/textos';
import { formatarInteiro, formatarMoedaCurta } from '../dinheiro';
import { avaliarNumeros } from '../equilibrio/calculo';
import { formatarDiaCurto } from '../planoAcao/datas';
import { BMC, LEAN } from '../quadros/definicoes';
import { svgIlustracao } from '../ui/ilustracoesDados';
import { barras, COLUNAS_POR_MES, MESES_JANELA, TOTAL_COLUNAS } from './cronograma';
import { graficoEquilibrio, tetoRedondo } from './grafico';
import { esc, mesAno, respostaOuTraco } from './html';
import type { DadosDocumento, Traduzir } from './tipos';

/**
 * One function per page of the PDF (plan §8, design PDF-*). Each returns a
 * `<section class="pagina">`; `montarDocumento` joins them. Pure.
 */

type Ctx = {
  d: DadosDocumento;
  t: Traduzir;
  /** The same `t`, typed for the analysis text helpers. */
  ta: TranslateFn;
  moeda: string;
  data: string;
};

export function criarCtx(d: DadosDocumento, t: Traduzir): Ctx {
  return {
    d,
    t,
    ta: t as unknown as TranslateFn,
    moeda: t('common.moeda'),
    data: mesAno(d.hoje, t('documento.mesesLongos').split(','), (mes, ano) =>
      t('documento.mesAno', { mes, ano }),
    ),
  };
}

const LOGO = `<svg width="36" height="36" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="18" fill="#1F4F8F"/><path d="M15 47h11V37h11V27h11" fill="none" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="48" cy="17" r="5.5" fill="#EF6F7A"/></svg>`;

function resposta(c: Ctx, quadro: 'lean' | 'bmc' | 'persona', campo: string): string {
  return c.d.respostas[quadro][campo]?.texto.trim() ?? '';
}

function topo(c: Ctx): string {
  return `<div class="topo"><b>${esc(c.d.negocio.nome)}</b><span>${esc(c.t('documento.planoDeNegocio'))} · ${esc(c.data)}</span></div>`;
}

function rodape(c: Ctx, pagina: number, esquerda?: string): string {
  return `<div class="rodape"><span>${esc(esquerda ?? c.t('documento.feitoCom'))}</span><span>${pagina}</span></div>`;
}

function linhaSegmento(c: Ctx): string {
  return `${c.t(`segmentos.${c.d.negocio.segmento}`)} · ${c.t(`estagios.${c.d.negocio.estagio}`)}`;
}

function empateTexto(c: Ctx): string {
  const i = c.d.analise.indicadores;
  return i
    ? c.t('documento.porMes', { n: formatarInteiro(i.empateMes), plural: c.d.unidade.plural })
    : '—';
}

/** Font size and line limit for the cover name, so a long name still fits. */
function tamanhoNome(nome: string): { px: number; linhas: number } {
  const maior = Math.max(...nome.split(/\s+/).map((p) => p.length), 0);
  if (nome.length <= 16 && maior <= 9) return { px: 104, linhas: 3 };
  if (nome.length <= 28 && maior <= 12) return { px: 80, linhas: 3 };
  if (nome.length <= 40) return { px: 60, linhas: 3 };
  return { px: 48, linhas: 4 };
}

// 1 · Capa ---------------------------------------------------------------

export function paginaCapa(c: Ctx): string {
  const nome = c.d.negocio.nome;
  const tamanho = tamanhoNome(nome);
  return `<section class="pagina capa">
  <div style="display:flex;flex-direction:column;height:100%">
    <div style="padding:80px 72px 0;display:flex;flex-direction:column;gap:28px;flex:1">
      <div style="display:flex;align-items:center;gap:12px">${LOGO}<span style="font-size:14px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#1F4F8F">${esc(c.t('documento.planoDeNegocio'))}</span></div>
      <div style="margin-top:120px;display:flex;flex-direction:column;gap:22px">
        <h1 class="clamp" style="font-size:${tamanho.px}px;line-height:1.02;-webkit-line-clamp:${tamanho.linhas};overflow-wrap:anywhere">${esc(nome)}</h1>
        <span style="width:72px;height:6px;border-radius:3px;background:#EF6F7A"></span>
        <div style="display:flex;flex-direction:column;gap:6px;font-size:20px;color:#3A4555">
          <span>${esc(linhaSegmento(c))}</span><span>${esc(c.data)}</span>
        </div>
      </div>
    </div>
    <div style="height:360px;background:#1F4F8F;position:relative;overflow:hidden;display:flex;align-items:flex-end;padding:0 72px 56px">
      <span style="position:absolute;width:380px;height:380px;border-radius:50%;background:#EF6F7A;right:-90px;top:-150px"></span>
      <span style="position:absolute;width:220px;height:220px;border-radius:50%;border:2px solid #4A73B0;right:210px;top:60px"></span>
      <div style="position:relative;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:32px;width:100%;color:#FFFFFF">
        ${[
          [c.t('documento.estagio'), c.t(`estagios.${c.d.negocio.estagio}`)],
          [c.t('partes.equilibrio'), empateTexto(c)],
          [c.t('documento.preenchido'), `${c.d.progresso.percentual}%`],
        ]
          .map(
            ([r, v]) =>
              `<div style="display:flex;flex-direction:column;gap:4px"><span style="font-size:13px;color:#D3E0F2">${esc(r!)}</span><span style="font-size:18px;font-weight:700">${esc(v!)}</span></div>`,
          )
          .join('')}
      </div>
    </div>
  </div>
</section>`;
}

// 2 · Sumário executivo ----------------------------------------------------

export function paginaSumario(c: Ctx): string {
  const n = avaliarNumeros(c.d.numeros);
  // The short promise (Lean "O que te faz diferente") makes the headline; the
  // persona's full value-proposition sentence has its own page.
  const proposta =
    resposta(c, 'lean', 'diferencial') || resposta(c, 'persona', 'proposta') || c.d.negocio.nome;
  const negocio = resposta(c, 'lean', 'solucao') || resposta(c, 'lean', 'problema');
  const paraQuem = resposta(c, 'lean', 'paraQuem') || resposta(c, 'bmc', 'segmentos');
  let dinheiro = resposta(c, 'lean', 'receitas') || resposta(c, 'bmc', 'receitas');
  if (n.tipo === 'ok') {
    const frase = c.t('documento.comoGanhaNumeros', {
      singular: c.d.unidade.singular,
      custo: formatarMoedaCurta(n.numeros.custoUnitario, c.moeda),
      preco: formatarMoedaCurta(n.numeros.preco, c.moeda),
      margem: formatarMoedaCurta(n.numeros.preco - n.numeros.custoUnitario, c.moeda),
    });
    dinheiro = dinheiro ? `${dinheiro.replace(/[.!]?\s*$/, '.')} ${frase}` : frase;
  }
  const pendentes = c.d.tarefas.filter((x) => !x.feita).map((x) => x.nome);
  const passos =
    pendentes.length > 0
      ? pendentes.slice(0, 4).join(' · ')
      : c.d.analise.passos.map((p) => textoPassoDocumento(c.ta, c.d.locale, p)).join(' · ');

  const secoes: [string, string][] = [
    [c.t('documento.oNegocio'), negocio],
    [c.t('documento.paraQuem'), paraQuem],
    [c.t('documento.comoGanha'), dinheiro],
    [c.t('documento.proximosPassos'), passos],
  ];

  const tiles =
    n.tipo === 'ok'
      ? `<div class="tiles" style="margin-top:36px">
      <div class="tile azul"><span class="r">${esc(c.t('partes.equilibrio'))}</span><span class="v">${esc(c.t('documento.barraMes', { n: formatarInteiro(c.d.analise.indicadores!.empateMes) }))}</span></div>
      <div class="tile"><span class="r">${esc(c.t('documento.precoVenda'))}</span><span class="v">${esc(formatarMoedaCurta(n.numeros.preco, c.moeda))}</span></div>
      <div class="tile"><span class="r">${esc(c.t('documento.custosFixos'))}</span><span class="v">${esc(formatarMoedaCurta(n.numeros.fixos, c.moeda))}</span></div>
    </div>`
      : '';

  return `<section class="pagina"><div class="conteudo">
  ${topo(c)}
  <div style="display:flex;flex-direction:column;gap:10px;margin-top:48px">
    <span class="rotulo">${esc(c.t('documento.secaoSumario'))}</span>
    <h1 class="clamp" style="font-size:42px;line-height:1.08;-webkit-line-clamp:3">${esc(proposta)}</h1>
  </div>
  ${tiles}
  <div style="margin-top:40px;display:flex;flex-direction:column;gap:26px;max-width:600px">
    ${secoes
      .map(
        ([titulo, texto]) => `<div style="display:flex;flex-direction:column;gap:8px">
      <h2 style="font-size:20px">${esc(titulo)}</h2>
      <p class="clamp quebra" style="font-size:16px;line-height:1.6;color:#2A3442;-webkit-line-clamp:4">${respostaOuTraco(texto)}</p>
    </div>`,
      )
      .join('')}
  </div>
  ${rodape(c, 2)}
</div></section>`;
}

// 3 · Diagnóstico -----------------------------------------------------------

function listaAchados(c: Ctx, achados: Achado[], vazio: string): string {
  if (achados.length === 0)
    return `<span style="font-size:14px;line-height:1.5;color:#545F6E">${esc(vazio)}</span>`;
  return achados
    .map((a) => {
      const { titulo, texto } = textoAchado(c.ta, c.d.locale, a);
      return `<span style="font-size:14px;line-height:1.5"><b>${esc(titulo)}.</b> ${esc(texto)}</span>`;
    })
    .join('');
}

export function paginaDiagnostico(c: Ctx): string {
  const a = c.d.analise;
  const i = a.indicadores;
  const pct = c.d.progresso.percentual;
  const tiles = i
    ? `<div class="tiles" style="margin-top:28px">
    <div class="tile azul"><span class="r">${esc(c.t('documento.sobraCadaVenda'))}</span><span class="v" style="font-size:28px">${esc(formatarPct(i.margemPct, c.d.locale))}%</span><span class="d">${esc(c.t('documento.sobraDetalhe', { um: formatarMoedaCurta(100, c.moeda), sobra: formatarMoedaCurta(Math.floor(i.margemPct), c.moeda) }))}</span></div>
    <div class="tile"><span class="r">${esc(c.t('documento.metaDiaria'))}</span><span class="v" style="font-size:28px">${esc(`${formatarInteiro(i.empateDia)} ${c.d.unidade.plural}`)}</span><span class="d">${esc(c.t('documento.metaDetalhe', { min: i.minutosPorVenda }))}</span></div>
    <div class="tile"><span class="r">${esc(c.t('documento.faturamentoEmpate'))}</span><span class="v" style="font-size:28px">${esc(formatarMoedaCurta(i.faturamentoEmpate, c.moeda))}</span><span class="d">${esc(c.t('documento.faturamentoDetalhe'))}</span></div>
  </div>`
    : `<p style="margin-top:28px;font-size:15px;color:#545F6E">${esc(c.t('documento.semNumeros'))}</p>`;

  return `<section class="pagina"><div class="conteudo">
  ${topo(c)}
  <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:24px;margin-top:44px">
    <div style="display:flex;flex-direction:column;gap:10px">
      <span class="rotulo">${esc(c.t('documento.secaoDiagnostico'))}</span>
      <h1 style="font-size:40px;line-height:1.1">${esc(c.t('documento.diagnosticoTitulo'))}</h1>
    </div>
    <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0">
      <span style="font-size:12px;color:#545F6E">${esc(c.t('documento.preenchido'))}</span>
      <span class="poppins" style="font-size:36px;color:#1F4F8F;line-height:1">${pct}%</span>
      <span style="width:140px;height:8px;border-radius:4px;background:#E7E1D7;overflow:hidden"><span style="display:block;width:${pct}%;height:100%;background:#1F4F8F;border-radius:4px"></span></span>
    </div>
  </div>
  ${tiles}
  <div style="margin-top:28px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px">
    <div style="border:1px solid #D6CFC3;border-radius:12px;padding:20px;display:flex;flex-direction:column;gap:12px;background:#FFFFFF">
      <span class="poppins" style="font-size:19px;color:#173B6C">${esc(c.t('analise.bom'))}</span>
      ${listaAchados(c, a.bom, c.t('documento.nadaBom'))}
    </div>
    <div style="border:1px solid #F2BCC2;border-radius:12px;padding:20px;display:flex;flex-direction:column;gap:12px;background:#FDF0F1">
      <span class="poppins" style="font-size:19px;color:#8A2433">${esc(c.t('analise.atencao'))}</span>
      ${listaAchados(c, a.atencao, c.t('analise.nenhumaAtencao'))}
    </div>
  </div>
  ${
    a.passos.length > 0
      ? `<div style="margin-top:28px;display:flex;flex-direction:column;gap:12px">
    <h2 style="font-size:22px">${esc(c.t('documento.passosSugeridos', { n: a.passos.length }))}</h2>
    ${a.passos
      .map(
        (p, k) => `<div style="display:flex;gap:14px;align-items:flex-start">
      <span style="width:30px;height:30px;border-radius:50%;background:#1F4F8F;color:#FFFFFF;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;flex-shrink:0">${k + 1}</span>
      <span style="font-size:15px;line-height:1.5;padding-top:4px">${esc(textoPassoDocumento(c.ta, c.d.locale, p))}</span>
    </div>`,
      )
      .join('')}
  </div>`
      : ''
  }
  <div style="margin-top:auto;display:flex;flex-direction:column;gap:10px">
    <span style="font-size:12px;line-height:1.5;color:#545F6E">${esc(c.t('analise.aviso'))}</span>
    ${rodape(c, 3).replace('class="rodape"', 'class="rodape" style="margin-top:0"')}
  </div>
</div></section>`;
}

// 4 e 5 · Canvas (paisagem) -----------------------------------------------

type Celula = { campo: string; coluna: string; linha: string; destaque?: boolean; linhas: number };

/** Lean Canvas layout of the design (PDF-3), field by field. */
const GRADE_LEAN: Celula[] = [
  { campo: 'problema', coluna: '1 / 3', linha: '1 / 3', linhas: 18 },
  { campo: 'solucao', coluna: '3 / 5', linha: '1 / 2', linhas: 8 },
  { campo: 'metricas', coluna: '3 / 5', linha: '2 / 3', linhas: 8 },
  { campo: 'diferencial', coluna: '5 / 7', linha: '1 / 3', destaque: true, linhas: 12 },
  { campo: 'vantagem', coluna: '7 / 9', linha: '1 / 2', linhas: 8 },
  { campo: 'canais', coluna: '7 / 9', linha: '2 / 3', linhas: 8 },
  { campo: 'paraQuem', coluna: '9 / 11', linha: '1 / 3', linhas: 18 },
  { campo: 'custos', coluna: '1 / 6', linha: '3 / 4', linhas: 5 },
  { campo: 'receitas', coluna: '6 / 11', linha: '3 / 4', linhas: 5 },
];

/** BMC layout of the design (PDF-4). */
const GRADE_BMC: Celula[] = [
  { campo: 'parcerias', coluna: '1 / 3', linha: '1 / 3', linhas: 18 },
  { campo: 'atividades', coluna: '3 / 5', linha: '1 / 2', linhas: 8 },
  { campo: 'recursos', coluna: '3 / 5', linha: '2 / 3', linhas: 8 },
  { campo: 'proposta', coluna: '5 / 7', linha: '1 / 3', destaque: true, linhas: 12 },
  { campo: 'relacionamento', coluna: '7 / 9', linha: '1 / 2', linhas: 8 },
  { campo: 'canais', coluna: '7 / 9', linha: '2 / 3', linhas: 8 },
  { campo: 'segmentos', coluna: '9 / 11', linha: '1 / 3', linhas: 18 },
  { campo: 'custos', coluna: '1 / 6', linha: '3 / 4', linhas: 5 },
  { campo: 'receitas', coluna: '6 / 11', linha: '3 / 4', linhas: 5 },
];

function paginaCanvas(
  c: Ctx,
  quadro: 'lean' | 'bmc',
  pagina: number,
  grade: Celula[],
  extra: Partial<Record<string, string>>,
): string {
  const blocos = grade
    .map((cel) => {
      let texto = resposta(c, quadro, cel.campo);
      const complemento = extra[cel.campo];
      if (complemento)
        texto = texto ? `${texto.replace(/[.!]?\s*$/, '.')} ${complemento}` : complemento;
      const classe = cel.destaque ? 'bloco destaque' : texto ? 'bloco' : 'bloco pendente';
      const linhas = cel.destaque ? Math.round(cel.linhas * 0.7) : cel.linhas;
      return `<div class="${texto ? classe : 'bloco pendente'}" style="grid-column:${cel.coluna};grid-row:${cel.linha}">
      <span class="t">${esc(c.t(`documento.${quadro}.${cel.campo}`))}</span>
      <span class="x clamp quebra" style="-webkit-line-clamp:${linhas}">${texto ? esc(texto) : esc(c.t('documento.aDefinir'))}</span>
    </div>`;
    })
    .join('');

  return `<section class="pagina paisagem"><div class="giro"><div style="display:flex;flex-direction:column;height:100%;padding:40px 48px 32px;gap:18px">
  <div style="display:flex;justify-content:space-between;align-items:flex-end">
    <div style="display:flex;flex-direction:column;gap:4px">
      <span class="rotulo" style="font-size:12px">${esc(c.t(quadro === 'lean' ? 'documento.secaoLean' : 'documento.secaoBmc'))}</span>
      <h1 style="font-size:32px">${esc(c.t(quadro === 'lean' ? 'partes.leanTecnico' : 'partes.bmcTecnico'))}</h1>
    </div>
    <span style="font-size:12px;color:#545F6E">${esc(c.d.negocio.nome)} · ${esc(c.data)}</span>
  </div>
  <div class="canvas">${blocos}</div>
  ${rodape(c, pagina, c.t(quadro === 'lean' ? 'documento.atribuicaoLean' : 'documento.atribuicaoBmc')).replace('class="rodape"', 'class="rodape" style="margin-top:0"')}
</div></div></section>`;
}

function complementoCustos(c: Ctx): Partial<Record<string, string>> {
  const n = avaliarNumeros(c.d.numeros);
  if (n.tipo !== 'ok') return {};
  return {
    custos: c.t('documento.fixosPorMes', { valor: formatarMoedaCurta(n.numeros.fixos, c.moeda) }),
  };
}

export function paginaLean(c: Ctx): string {
  return paginaCanvas(c, 'lean', 4, GRADE_LEAN, complementoCustos(c));
}

export function paginaBmc(c: Ctx): string {
  return paginaCanvas(c, 'bmc', 5, GRADE_BMC, complementoCustos(c));
}

// 6 · SWOT -----------------------------------------------------------------

const COR_SWOT: Record<ParteSwot, { fundo: string; titulo: string }> = {
  forcas: { fundo: '#E4ECF7', titulo: '#173B6C' },
  fraquezas: { fundo: '#F4F1EB', titulo: '#3A4555' },
  oportunidades: { fundo: '#FCE3E5', titulo: '#8A2433' },
  ameacas: { fundo: '#ECE7F5', titulo: '#4B2E83' },
};

const COR_CRUZAMENTO = {
  ataque: '#1F4F8F',
  defesa: '#1F4F8F',
  melhore: '#A3364A',
  evite: '#4B2E83',
};

export function paginaSwot(c: Ctx): string {
  const quadrante = (parte: ParteSwot) => {
    const itens = c.d.swot.filter((i) => i.parte === parte).sort((a, b) => a.ordem - b.ordem);
    const mostrados = itens.slice(0, 5);
    return `<div style="background:${COR_SWOT[parte].fundo};border-radius:12px;padding:18px;display:flex;flex-direction:column;gap:9px;overflow:hidden">
      <span class="poppins" style="font-size:21px;color:${COR_SWOT[parte].titulo}">${esc(c.t(`swot.${parte}.nome`))}</span>
      ${
        mostrados.length
          ? mostrados
              .map(
                (i) =>
                  `<span class="clamp" style="font-size:14px;line-height:1.45;-webkit-line-clamp:2">${esc(i.texto)}</span>`,
              )
              .join('')
          : '<span class="vazio" style="font-size:14px">—</span>'
      }
      ${itens.length > 5 ? `<span style="font-size:12px;color:#545F6E">${esc(c.t('documento.eMais', { n: itens.length - 5 }))}</span>` : ''}
    </div>`;
  };
  const eixo = (texto: string, vertical: boolean) =>
    `<span style="${vertical ? 'writing-mode:vertical-rl;transform:rotate(180deg);' : ''}font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#545F6E;display:flex;align-items:center;justify-content:center">${esc(texto)}</span>`;
  const cruz = c.d.analise.cruzamentosSwot;

  return `<section class="pagina"><div class="conteudo">
  ${topo(c)}
  <div style="display:flex;flex-direction:column;gap:10px;margin-top:40px">
    <span class="rotulo">${esc(c.t('documento.secaoSwot'))}</span>
    <h1 style="font-size:38px;line-height:1.1">${esc(c.t('documento.swotTitulo'))}</h1>
  </div>
  <div style="margin-top:24px;display:grid;grid-template-columns:24px repeat(2,minmax(0,1fr));grid-template-rows:24px 1fr 1fr;gap:8px;height:470px">
    <span></span>${eixo(c.t('documento.ajudam'), false)}${eixo(c.t('documento.atrapalham'), false)}
    ${eixo(c.t('documento.dentro'), true)}${quadrante('forcas')}${quadrante('fraquezas')}
    ${eixo(c.t('documento.fora'), true)}${quadrante('oportunidades')}${quadrante('ameacas')}
  </div>
  ${
    cruz.length
      ? `<div style="margin-top:26px;display:flex;flex-direction:column;gap:12px">
    <div style="display:flex;justify-content:space-between;align-items:baseline">
      <h2 style="font-size:22px">${esc(c.t('documento.cruzando'))}</h2>
      <span style="font-size:12px;color:#545F6E">${esc(c.t('documento.estrategias'))}</span>
    </div>
    <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px">
      ${cruz
        .map((x) => {
          const { rotulo, texto } = textoCruzamento(c.ta, x);
          return `<div style="border:1px solid #D6CFC3;border-radius:10px;padding:14px;display:flex;flex-direction:column;gap:6px;background:#FFFFFF">
        <span style="font-size:12px;font-weight:700;color:${COR_CRUZAMENTO[x.tipo]}">${esc(rotulo)}</span>
        <span class="clamp" style="font-size:14px;line-height:1.45;-webkit-line-clamp:4">${esc(texto)}</span>
      </div>`;
        })
        .join('')}
    </div>
  </div>`
      : ''
  }
  ${rodape(c, 6)}
</div></section>`;
}

// 7 · Persona --------------------------------------------------------------

export function paginaPersona(c: Ctx): string {
  const quem = resposta(c, 'persona', 'quem');
  const nome = quem.split(',')[0]?.trim() || c.t('formulario.personaPadrao');
  const genero = c
    .t(c.d.ilustracao === 'homem' ? 'formulario.homem' : 'formulario.mulher')
    .toLowerCase();
  const colunas: [string, string][] = [
    [c.t('quadros.persona.quer.bloco'), resposta(c, 'persona', 'quer')],
    [c.t('quadros.persona.incomoda.bloco'), resposta(c, 'persona', 'incomoda')],
    [c.t('quadros.persona.decide.bloco'), resposta(c, 'persona', 'decide')],
  ];
  const resolve = resposta(c, 'lean', 'solucao') || resposta(c, 'lean', 'diferencial');
  const conquistar = c.d.analise.conquistar;

  return `<section class="pagina"><div class="conteudo">
  ${topo(c)}
  <div style="display:flex;flex-direction:column;gap:10px;margin-top:48px">
    <span class="rotulo">${esc(c.t('documento.secaoPersona'))}</span>
    <h1 style="font-size:44px;line-height:1.05">${esc(c.t('documento.personaTitulo'))}</h1>
  </div>
  <div style="margin-top:32px;border:1px solid #D6CFC3;border-radius:16px;background:#FFFFFF;padding:28px;display:flex;flex-direction:column;gap:22px">
    <div style="display:flex;align-items:center;gap:18px">
      <span role="img" aria-label="${esc(c.t('formulario.ilustracaoRotulo', { genero, nome }))}">${svgIlustracao(c.d.ilustracao, 72, 'persona-pdf')}</span>
      <span style="display:flex;flex-direction:column;gap:4px;min-width:0">
        <span class="poppins clamp" style="font-size:26px;-webkit-line-clamp:2">${respostaOuTraco(quem)}</span>
        <span class="clamp" style="font-size:15px;color:#3A4555;-webkit-line-clamp:2">${respostaOuTraco(resposta(c, 'persona', 'rotina'))}</span>
      </span>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px">
      ${colunas
        .map(
          ([r, v]) => `<div style="display:flex;flex-direction:column;gap:8px">
        <span style="font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#1F4F8F">${esc(r)}</span>
        <span class="clamp quebra" style="font-size:15px;line-height:1.5;-webkit-line-clamp:5">${respostaOuTraco(v)}</span>
      </div>`,
        )
        .join('')}
    </div>
  </div>
  <div style="margin-top:28px;display:flex;flex-direction:column;gap:12px">
    <h2 style="font-size:24px">${esc(c.t('documento.propostaValor'))}</h2>
    <p class="poppins clamp" style="font-size:22px;line-height:1.4;color:#173B6C;-webkit-line-clamp:4">${respostaOuTraco(resposta(c, 'persona', 'proposta'))}</p>
  </div>
  <table style="margin-top:22px;width:100%;border-collapse:collapse;font-size:15px">
    <thead><tr>
      <th style="text-align:left;padding:10px 12px;border-bottom:2px solid #18212E;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;width:45%">${esc(c.t('documento.dorCliente'))}</th>
      <th style="text-align:left;padding:10px 12px;border-bottom:2px solid #18212E;font-size:12px;letter-spacing:0.08em;text-transform:uppercase">${esc(c.t('documento.comoResolve'))}</th>
    </tr></thead>
    <tbody><tr>
      <td class="quebra" style="padding:12px;border-bottom:1px solid #D6CFC3;vertical-align:top">${respostaOuTraco(resposta(c, 'persona', 'incomoda'))}</td>
      <td class="quebra" style="padding:12px;border-bottom:1px solid #D6CFC3;vertical-align:top">${respostaOuTraco(resolve)}</td>
    </tr></tbody>
  </table>
  ${
    conquistar.length
      ? `<div style="margin-top:24px;background:#F4F1EB;border-radius:14px;padding:20px 22px;display:flex;flex-direction:column;gap:12px">
    <h2 style="font-size:20px">${esc(c.t('analise.conquistar.titulo', { nome }))}</h2>
    <div style="display:grid;grid-template-columns:repeat(${conquistar.length},minmax(0,1fr));gap:16px">
      ${conquistar
        .map(
          (item) =>
            `<div style="display:flex;flex-direction:column;gap:4px"><span style="font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#1F4F8F">${esc(rotuloConquistar(c.ta, item, nome))}</span><span class="clamp" style="font-size:14px;line-height:1.45;-webkit-line-clamp:4">${esc(item.chave === 'dizer' ? `“${item.texto}”` : item.texto)}</span></div>`,
        )
        .join('')}
    </div>
  </div>`
      : ''
  }
  ${rodape(c, 7)}
</div></section>`;
}

// 8 · Números --------------------------------------------------------------

export function paginaNumeros(c: Ctx): string {
  const n = avaliarNumeros(c.d.numeros);
  const i = c.d.analise.indicadores;
  const { singular, plural } = c.d.unidade;
  const m = (v: number) => formatarMoedaCurta(v, c.moeda);

  if (n.tipo !== 'ok' || !i) {
    return `<section class="pagina"><div class="conteudo">
  ${topo(c)}
  <div style="display:flex;flex-direction:column;gap:10px;margin-top:40px">
    <span class="rotulo">${esc(c.t('documento.secaoNumeros'))}</span>
    <h1 style="font-size:40px;line-height:1.1">${esc(c.t('partes.equilibrio'))}</h1>
  </div>
  <p style="margin-top:28px;font-size:16px;line-height:1.6;color:#545F6E">${esc(c.t('documento.semNumeros'))}</p>
  ${rodape(c, 8)}
</div></section>`;
  }

  const linhas = [
    ...c.d.analise.cenarios.map((x) => ({ ...x, empate: false })),
    { vendas: i.empateMes, faturamento: i.faturamentoEmpate, resultado: 0, empate: true },
  ].sort((a, b) => a.vendas - b.vendas);

  const maiorCusto = c.d.numeros.maiorCusto?.trim();
  const rotuloESe = (chave: 'preco' | 'custo' | 'fixos', valor: number) => {
    if (chave === 'preco') return c.t('documento.eSePreco', { valor: m(valor) });
    if (chave === 'custo') {
      return maiorCusto
        ? c.t('documento.eSeMaiorCusto', { maiorCusto, singular, valor: m(valor) })
        : c.t('documento.eSeCusto', { singular, valor: m(valor) });
    }
    return c.t('documento.eSeFixos', { valor: m(valor) });
  };

  const ySteps = tetoRedondo(Math.max(i.empateMes * 1.6 * n.numeros.preco, 1));
  const eixoY = (centavos: number) =>
    centavos === 0
      ? '0'
      : ySteps >= 200_000
        ? c.t('documento.mil', { n: formatarInteiro(centavos / 100_000) })
        : formatarInteiro(centavos / 100);

  return `<section class="pagina"><div class="conteudo">
  ${topo(c)}
  <div style="display:flex;flex-direction:column;gap:10px;margin-top:40px">
    <span class="rotulo">${esc(c.t('documento.secaoNumeros'))}</span>
    <h1 style="font-size:40px;line-height:1.1">${esc(c.t('partes.equilibrio'))}</h1>
  </div>
  <div style="margin-top:20px;background:#E4ECF7;border-radius:16px;padding:20px 24px;display:flex;align-items:center;gap:22px">
    <span class="poppins" style="font-size:64px;line-height:1;color:#1F4F8F">${esc(formatarInteiro(i.empateMes))}</span>
    <span style="font-size:16px;line-height:1.45;color:#173B6C">${esc(c.t('documento.empateFrase', { plural, dia: formatarInteiro(i.empateDia), singular, margem: m(i.margemUnit) }))}</span>
  </div>
  <div style="margin-top:14px;display:flex;flex-wrap:wrap;gap:6px 20px;font-size:13px;color:#3A4555">
    <span>${esc(c.t('documento.fixos'))} <b style="color:#18212E">${esc(c.t('documento.valorMes', { valor: m(n.numeros.fixos) }))}</b></span>
    <span>${esc(c.t('documento.custoDe', { singular }))} <b style="color:#18212E">${esc(m(n.numeros.custoUnitario))}</b></span>
    <span>${esc(c.t('equilibrio.preco'))} <b style="color:#18212E">${esc(m(n.numeros.preco))}</b></span>
    <span>${esc(c.t('documento.sobraPor', { singular }))} <b style="color:#18212E">${esc(`${m(i.margemUnit)} (${formatarPct(i.margemPct, c.d.locale)}%)`)}</b></span>
  </div>
  <figure style="margin:18px 0 0;display:flex;flex-direction:column;gap:6px">
    ${graficoEquilibrio(n.numeros, i.empateMes, {
      lucro: c.t('documento.lucro'),
      prejuizo: c.t('documento.prejuizo'),
      receita: c.t('documento.receita'),
      custoTotal: c.t('documento.custoTotal'),
      ponto: `${formatarInteiro(i.empateMes)} ${plural} · ${m(i.faturamentoEmpate)}`,
      eixoY,
      descricao: c.t('documento.graficoDescricao', {
        n: formatarInteiro(i.empateMes),
        plural,
        valor: m(i.faturamentoEmpate),
      }),
    })}
    <figcaption style="font-size:12px;color:#545F6E">${esc(c.t('documento.graficoLegenda', { plural }))}</figcaption>
  </figure>
  <div style="margin-top:20px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px">
    <div style="display:flex;flex-direction:column;gap:10px">
      <h2 style="font-size:20px">${esc(c.t('documento.cenarios'))}</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <thead><tr>
          <th style="text-align:left;padding:8px 6px;border-bottom:2px solid #18212E;font-size:12px">${esc(c.t('documento.vendas'))}</th>
          <th style="text-align:right;padding:8px 6px;border-bottom:2px solid #18212E;font-size:12px">${esc(c.t('documento.faturamento'))}</th>
          <th style="text-align:right;padding:8px 6px;border-bottom:2px solid #18212E;font-size:12px">${esc(c.t('documento.resultado'))}</th>
        </tr></thead>
        <tbody style="font-variant-numeric:tabular-nums">
          ${linhas
            .map((l) => {
              const td = 'padding:9px 6px;border-bottom:1px solid #D6CFC3';
              const resultado = l.empate
                ? `<td style="${td};text-align:right;font-weight:700">${esc(c.t('documento.empate'))}</td>`
                : `<td style="${td};text-align:right;font-weight:700;color:${l.resultado < 0 ? '#9B2C1E' : '#1F4F8F'}">${esc(`${l.resultado < 0 ? '−' : '+'} ${m(Math.abs(l.resultado))}`)}</td>`;
              return `<tr${l.empate ? ' style="background:#E4ECF7"' : ''}><td style="${td}${l.empate ? ';font-weight:700' : ''}">${esc(formatarInteiro(l.vendas))}</td><td style="${td};text-align:right">${esc(m(l.faturamento))}</td>${resultado}</tr>`;
            })
            .join('')}
        </tbody>
      </table>
    </div>
    <div style="display:flex;flex-direction:column;gap:10px">
      <h2 style="font-size:20px">${esc(c.t('documento.eSe'))}</h2>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${c.d.analise.eSe
          .map(
            (
              e,
            ) => `<div style="border:1px solid #D6CFC3;border-radius:10px;padding:10px 14px;display:flex;justify-content:space-between;align-items:center;gap:12px;background:#FFFFFF">
          <span style="font-size:14px;line-height:1.4">${esc(rotuloESe(e.chave, e.valor))}</span>
          <span style="font-size:14px;font-weight:700;color:${e.novoEmpate !== null && e.novoEmpate <= i.empateMes ? '#1F4F8F' : '#9B2C1E'};white-space:nowrap">${esc(e.novoEmpate === null ? c.t('documento.naoFecha') : c.t('documento.barraMes', { n: formatarInteiro(e.novoEmpate) }))}</span>
        </div>`,
          )
          .join('')}
      </div>
      <span style="font-size:12px;line-height:1.45;color:#545F6E">${esc(c.t('documento.eSeLegenda', { plural }))}</span>
    </div>
  </div>
  ${rodape(c, 8)}
</div></section>`;
}

// 9 · Plano de ação --------------------------------------------------------

export function paginaPlano(c: Ctx): string {
  const tarefas = c.d.tarefas;
  const feitas = tarefas.filter((x) => x.feita).length;
  const meses = c.t('planoAcao.meses').split(',');
  const mesesLongos = c.t('documento.mesesLongos').split(',');
  const proxima = tarefas
    .filter((x) => !x.feita && x.data)
    .sort((a, b) => a.data!.localeCompare(b.data!))[0];
  const i = c.d.analise.indicadores;
  const inicio = new Date(c.d.hoje);
  const lista = barras(tarefas, c.d.hoje);
  const MAX_LINHAS = 9;
  const visiveis = lista.slice(0, MAX_LINHAS);

  const cabecalhoMeses = Array.from({ length: MESES_JANELA }, (_, k) => {
    const mes = (inicio.getMonth() + k) % 12;
    return `<span style="grid-column:span ${COLUNAS_POR_MES};padding:12px 0;text-align:center;border-left:1px solid #D6CFC3">${esc(mesesLongos[mes] ?? '')}</span>`;
  }).join('');

  const linhas = visiveis
    .map((b, k) => {
      const ultima = k === visiveis.length - 1;
      const cor = b.tarefa.feita ? '#B8C9E2' : '#1F4F8F';
      const barra =
        b.de === null
          ? `<span style="grid-column:2 / ${TOTAL_COLUNAS + 2};padding:0 8px;font-size:12px;color:#8A93A0">${esc(c.t('planoAcao.semData'))}</span>`
          : `<span style="grid-column:${b.de} / ${b.ate};height:14px;border-radius:7px;background:${cor};margin:0 4px"></span>`;
      return `<div style="display:grid;grid-template-columns:220px repeat(${TOTAL_COLUNAS},minmax(0,1fr));align-items:center;min-height:50px${ultima ? '' : ';border-bottom:1px solid #E7E1D7'}">
      <span class="clamp" style="padding:0 14px;font-size:14px;-webkit-line-clamp:2;${b.tarefa.feita ? 'color:#545F6E;text-decoration:line-through' : 'font-weight:700'}">${esc(b.tarefa.nome)}</span>
      ${barra}
    </div>`;
    })
    .join('');

  const tarefasRegras = new Set(tarefas.map((x) => x.origemRegra).filter(Boolean));
  const naoCobre = c.d.analise.atencao.filter((a) => !tarefasRegras.has(a.regra)).slice(0, 2);
  const passoDe = (regra: string) => c.d.analise.passos.find((p) => p.regra === regra);

  return `<section class="pagina"><div class="conteudo">
  ${topo(c)}
  <div style="display:flex;flex-direction:column;gap:10px;margin-top:44px">
    <span class="rotulo">${esc(c.t('documento.secaoPlano'))}</span>
    <h1 style="font-size:40px;line-height:1.1">${esc(c.t('documento.planoTitulo'))}</h1>
  </div>
  <div class="tiles" style="margin-top:28px">
    <div class="tile azul"><span class="r">${esc(c.t('documento.andamento'))}</span><span class="v">${esc(c.t('documento.deTotal', { n: feitas, total: tarefas.length }))}</span><span class="d">${esc(c.t('documento.tarefasConcluidas'))}</span></div>
    <div class="tile"><span class="r">${esc(c.t('documento.proximoPrazo'))}</span><span class="v">${esc(proxima ? (formatarDiaCurto(proxima.data, meses) ?? '—') : '—')}</span><span class="d clamp" style="-webkit-line-clamp:2">${esc(proxima?.nome ?? c.t('documento.semPrazo'))}</span></div>
    <div class="tile goiaba"><span class="r">${esc(c.t('documento.meta'))}</span><span class="v">${esc(i ? c.t('documento.barraMes', { n: formatarInteiro(i.empateMes) }) : '—')}</span><span class="d">${esc(c.t('documento.metaTexto', { plural: c.d.unidade.plural }))}</span></div>
  </div>
  ${
    tarefas.length
      ? `<div style="margin-top:28px;display:flex;flex-direction:column;border:1px solid #D6CFC3;border-radius:12px;overflow:hidden;background:#FFFFFF">
    <div style="display:grid;grid-template-columns:220px repeat(${TOTAL_COLUNAS},minmax(0,1fr));background:#F4F1EB;border-bottom:1px solid #D6CFC3;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#3A4555">
      <span style="padding:12px 14px">${esc(c.t('documento.tarefa'))}</span>${cabecalhoMeses}
    </div>
    ${linhas}
  </div>
  ${lista.length > MAX_LINHAS ? `<span style="margin-top:6px;font-size:12px;color:#545F6E">${esc(c.t('documento.eMais', { n: lista.length - MAX_LINHAS }))}</span>` : ''}
  <div style="margin-top:10px;display:flex;gap:20px;font-size:12px;color:#545F6E">
    <span style="display:flex;align-items:center;gap:6px"><span style="width:14px;height:8px;border-radius:4px;background:#B8C9E2"></span>${esc(c.t('documento.concluida'))}</span>
    <span style="display:flex;align-items:center;gap:6px"><span style="width:14px;height:8px;border-radius:4px;background:#1F4F8F"></span>${esc(c.t('documento.planejada'))}</span>
  </div>`
      : `<p style="margin-top:28px;font-size:15px;color:#545F6E">${esc(c.t('documento.semTarefas'))}</p>`
  }
  ${
    naoCobre.length || i
      ? `<div style="margin-top:28px;display:flex;flex-direction:column;gap:12px">
    <h2 style="font-size:22px">${esc(c.t('documento.naoCobre'))}</h2>
    <div style="display:flex;flex-direction:column;gap:10px">
      ${naoCobre
        .map((a) => {
          const { titulo } = textoAchado(c.ta, c.d.locale, a);
          const p = passoDe(a.regra);
          return `<div style="border:1px solid #F2BCC2;background:#FDF0F1;border-radius:10px;padding:14px 16px;display:flex;gap:12px;align-items:flex-start">
        <span style="font-size:12px;font-weight:700;color:#8A2433;padding-top:2px;flex-shrink:0;width:120px">${esc(titulo)}</span>
        <span style="font-size:14px;line-height:1.45">${esc(p ? c.t('documento.sugestao', { passo: textoPassoDocumento(c.ta, c.d.locale, p) }) : textoAchado(c.ta, c.d.locale, a).texto)}</span>
      </div>`;
        })
        .join('')}
      ${
        i
          ? `<div style="border:1px solid #F2BCC2;background:#FDF0F1;border-radius:10px;padding:14px 16px;display:flex;gap:12px;align-items:flex-start">
        <span style="font-size:12px;font-weight:700;color:#8A2433;padding-top:2px;flex-shrink:0;width:120px">${esc(c.t('documento.acompanhamento'))}</span>
        <span style="font-size:14px;line-height:1.45">${esc(c.t('documento.acompanhamentoTexto', { n: formatarInteiro(i.empateDia), plural: c.d.unidade.plural }))}</span>
      </div>`
          : ''
      }
    </div>
  </div>`
      : ''
  }
  ${rodape(c, 9)}
</div></section>`;
}

export const PAGINAS = [
  paginaCapa,
  paginaSumario,
  paginaDiagnostico,
  paginaLean,
  paginaBmc,
  paginaSwot,
  paginaPersona,
  paginaNumeros,
  paginaPlano,
] as const;

/** The design's canvas field order, for completeness checks. */
export const CAMPOS_CANVAS = { lean: LEAN.campos, bmc: BMC.campos };
