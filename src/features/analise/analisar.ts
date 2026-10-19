import type { Negocio, Numeros, RespostasPorQuadro, SwotItem, Tarefa } from '@/data/types';

import { avaliarNumeros, calcularIndicadores, type Indicadores } from '../equilibrio/calculo';
import type { Unidade } from '../equilibrio/unidade';
import { QUADROS } from '../quadros/definicoes';
import { LIMITE_EMPATE_DIA } from './limites';
import { cenarios, eSe, minutosPorVenda, type Cenario, type ESe } from './numeros';

/**
 * The analysis engine (plan §7): deterministic rules over the answers and the
 * numbers. No network and no AI — the same input always gives the same
 * analysis, in the app and in the PDF, and every rule is tested.
 *
 * Rules return ids and parameters; the sentences live in the locales under
 * `analise.regras.<id>` (see `textos.ts`). Quoting what the person wrote
 * ("quente em 25 minutos") comes from their data, not from a fixed string, so
 * it does not break invariant 6.
 *
 * Pure: `node --test` runs it (`analisar.test.ts`).
 */

export type Entrada = {
  negocio: Negocio;
  respostas: RespostasPorQuadro;
  swot: readonly SwotItem[];
  numeros: Numeros;
  tarefas: readonly Tarefa[];
  unidade: Unidade;
};

export type Parametros = Record<string, string | number>;

export type Achado = {
  regra: IdRegra;
  severidade: 1 | 2 | 3;
  params: Parametros;
};

/** Where a next step leads: a question to answer, or a task to add to the plan. */
export type DestinoPasso =
  | { tipo: 'lean'; pergunta: number }
  | { tipo: 'equilibrio' }
  | { tipo: 'swot' }
  | { tipo: 'persona'; pergunta: number }
  | { tipo: 'plano' }
  | { tipo: 'tarefa' };

export type Passo = {
  regra: IdRegra;
  params: Parametros;
  destino: DestinoPasso;
};

export type Cruzamento = {
  tipo: 'ataque' | 'defesa' | 'melhore' | 'evite';
  params: Parametros;
};

export type ItemConquistar = { chave: 'onde' | 'decide' | 'dizer'; texto: string };

export type Analise = {
  indicadores: (Indicadores & { minutosPorVenda: number }) | null;
  cenarios: Cenario[];
  eSe: ESe[];
  /** Up to 3, most severe first. */
  atencao: Achado[];
  /** Up to 2. */
  bom: Achado[];
  /** Up to 3, following the points of attention. */
  passos: Passo[];
  /** For the PDF's SWOT page: the first item of each part, crossed. */
  cruzamentosSwot: Cruzamento[];
  /** "Como conquistar a {persona}", for the PDF's persona page. */
  conquistar: ItemConquistar[];
};

export const ID_REGRAS = [
  'sem_numeros',
  'canais_vazios',
  'margem_baixa',
  'custo_dominante',
  'capacidade',
  'empate_alto',
  'ideia_sem_validacao',
  'proposta_vaga',
  'swot_desequilibrado',
  'persona_sem_decisao',
  'margem_boa',
  'proposta_mensuravel',
  'cliente_definido',
  'sem_tarefas',
] as const;
export type IdRegra = (typeof ID_REGRAS)[number];

export const MAX_ATENCAO = 3;
export const MAX_BOM = 2;
export const MAX_PASSOS = 3;

/** Weaknesses that say the business rests on one person. */
const SO_UMA_PESSOA =
  /\b(s[óo]zinh[oa]|s[óo] eu|s[óo] uma pessoa|uma pessoa s[óo]|uma pessoa|um funcion[áa]rio|sem ajuda|sem funcion[áa]rio)/i;

/** A promise someone can check: it holds a number or a time. */
const MENSURAVEL = /\d/;

/** Below this, a value proposition is too short to say anything. */
const PROPOSTA_CURTA = 25;

/** Quotes are cut so a long answer does not swallow the sentence. */
const LIMITE_CITACAO = 60;

function citar(texto: string): string {
  const limpo = texto
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[.!;]+$/, '');
  return limpo.length > LIMITE_CITACAO ? `${limpo.slice(0, LIMITE_CITACAO - 1).trimEnd()}…` : limpo;
}

function resposta(entrada: Entrada, quadro: 'lean' | 'bmc' | 'persona', campo: string): string {
  return entrada.respostas[quadro][campo]?.texto.trim() ?? '';
}

function perguntaDe(quadro: 'lean' | 'persona', campo: string): number {
  return QUADROS[quadro].campos.indexOf(campo) + 1;
}

/** Everything the rules fire, before the limits — exported for the tests. */
export function aplicarRegras(entrada: Entrada): { achados: Achado[]; passos: Passo[] } {
  const achados: Achado[] = [];
  const passos: Passo[] = [];
  const estado = avaliarNumeros(entrada.numeros);
  const ind = estado.tipo === 'ok' ? calcularIndicadores(estado.numeros) : null;
  const { singular, plural } = entrada.unidade;
  const fraquezas = entrada.swot.filter((i) => i.parte === 'fraquezas').map((i) => i.texto);
  const forcas = entrada.swot.filter((i) => i.parte === 'forcas');
  const ruins = entrada.swot.filter((i) => i.parte === 'fraquezas' || i.parte === 'ameacas');
  const propostaPersona = resposta(entrada, 'persona', 'proposta');
  const proposta = propostaPersona || resposta(entrada, 'lean', 'diferencial');
  const maiorCusto = entrada.numeros.maiorCusto?.trim() ?? '';
  const personaComecada = Object.keys(entrada.respostas.persona).some(
    (c) => c !== 'ilustracao' && entrada.respostas.persona[c]?.texto.trim(),
  );

  if (!ind) {
    achados.push({ regra: 'sem_numeros', severidade: 3, params: {} });
    passos.push({ regra: 'sem_numeros', params: {}, destino: { tipo: 'equilibrio' } });
  }

  if (!resposta(entrada, 'lean', 'canais')) {
    achados.push({
      regra: 'canais_vazios',
      severidade: 3,
      params: { empateDia: ind?.empateDia ?? 0, plural },
    });
    passos.push({
      regra: 'canais_vazios',
      params: {},
      destino: { tipo: 'lean', pergunta: perguntaDe('lean', 'canais') },
    });
  }

  if (ind && ind.margemPct < 30) {
    achados.push({ regra: 'margem_baixa', severidade: 3, params: { pct: ind.margemPct } });
    passos.push({ regra: 'margem_baixa', params: {}, destino: { tipo: 'equilibrio' } });
  }

  if (
    ind &&
    maiorCusto &&
    ind.sensibilidadeCusto !== null &&
    ind.sensibilidadeCusto >= ind.empateMes * 0.05
  ) {
    const params = { maiorCusto: citar(maiorCusto), n: ind.sensibilidadeCusto, singular, plural };
    achados.push({ regra: 'custo_dominante', severidade: 2, params });
    passos.push({ regra: 'custo_dominante', params, destino: { tipo: 'tarefa' } });
  }

  const sozinho = fraquezas.find((f) => SO_UMA_PESSOA.test(f));
  if (sozinho) {
    const params = { fraqueza: citar(sozinho), empateDia: ind?.empateDia ?? 0, plural };
    achados.push({ regra: 'capacidade', severidade: 2, params });
    passos.push({ regra: 'capacidade', params, destino: { tipo: 'tarefa' } });
  }

  const limite = LIMITE_EMPATE_DIA[entrada.negocio.segmento];
  if (ind && ind.empateDia > limite) {
    achados.push({
      regra: 'empate_alto',
      severidade: 2,
      params: { empateDia: ind.empateDia, limite, plural },
    });
    passos.push({ regra: 'empate_alto', params: {}, destino: { tipo: 'equilibrio' } });
  }

  if (entrada.negocio.estagio === 'ideia' && !resposta(entrada, 'lean', 'metricas')) {
    achados.push({ regra: 'ideia_sem_validacao', severidade: 2, params: {} });
    passos.push({
      regra: 'ideia_sem_validacao',
      params: {},
      destino: { tipo: 'lean', pergunta: perguntaDe('lean', 'metricas') },
    });
  }

  if (!proposta || proposta.length < PROPOSTA_CURTA) {
    achados.push({
      regra: 'proposta_vaga',
      severidade: 1,
      params: { proposta: proposta ? citar(proposta) : '' },
    });
    passos.push({
      regra: 'proposta_vaga',
      params: {},
      destino: propostaPersona
        ? { tipo: 'persona', pergunta: perguntaDe('persona', 'proposta') }
        : { tipo: 'lean', pergunta: perguntaDe('lean', 'diferencial') },
    });
  }

  if (ruins.length > 0 && ruins.length > 2 * forcas.length) {
    achados.push({
      regra: 'swot_desequilibrado',
      severidade: 1,
      params: { ruins: ruins.length, forcas: forcas.length },
    });
    passos.push({ regra: 'swot_desequilibrado', params: {}, destino: { tipo: 'swot' } });
  }

  if (personaComecada && !resposta(entrada, 'persona', 'decide')) {
    achados.push({ regra: 'persona_sem_decisao', severidade: 1, params: {} });
    passos.push({
      regra: 'persona_sem_decisao',
      params: {},
      destino: { tipo: 'persona', pergunta: perguntaDe('persona', 'decide') },
    });
  }

  if (ind && ind.margemPct >= 50) {
    achados.push({ regra: 'margem_boa', severidade: 1, params: { pct: ind.margemPct } });
  }

  if (proposta && MENSURAVEL.test(proposta)) {
    achados.push({
      regra: 'proposta_mensuravel',
      severidade: 1,
      params: { proposta: citar(proposta) },
    });
  }

  if (QUADROS.persona.campos.every((c) => resposta(entrada, 'persona', c))) {
    achados.push({
      regra: 'cliente_definido',
      severidade: 1,
      params: { nome: citar(resposta(entrada, 'persona', 'quem').split(',')[0] ?? '') },
    });
  }

  if (!entrada.tarefas.some((t) => !t.feita)) {
    passos.push({ regra: 'sem_tarefas', params: {}, destino: { tipo: 'plano' } });
  }

  return { achados, passos };
}

/** Rules whose finding is good news; everything else is a point of attention. */
const BOAS: ReadonlySet<IdRegra> = new Set([
  'margem_boa',
  'proposta_mensuravel',
  'cliente_definido',
]);

export function analisar(entrada: Entrada): Analise {
  const estado = avaliarNumeros(entrada.numeros);
  const ind = estado.tipo === 'ok' ? calcularIndicadores(estado.numeros) : null;
  const { achados, passos } = aplicarRegras(entrada);

  // Stable: equal severities keep the order the rules are listed in.
  const atencao = achados
    .filter((a) => !BOAS.has(a.regra))
    .map((a, i) => ({ a, i }))
    .sort((x, y) => y.a.severidade - x.a.severidade || x.i - y.i)
    .map(({ a }) => a)
    .slice(0, MAX_ATENCAO);
  const bom = achados.filter((a) => BOAS.has(a.regra)).slice(0, MAX_BOM);

  // Steps follow the points of attention shown, then the ones that stand alone.
  const ordem = new Map(atencao.map((a, i) => [a.regra, i]));
  const proximos = passos
    .filter((p) => ordem.has(p.regra) || p.regra === 'sem_tarefas')
    .sort((x, y) => (ordem.get(x.regra) ?? 99) - (ordem.get(y.regra) ?? 99))
    .slice(0, MAX_PASSOS);

  return {
    indicadores:
      ind && estado.tipo === 'ok'
        ? { ...ind, minutosPorVenda: minutosPorVenda(ind.empateDia) }
        : null,
    cenarios: ind && estado.tipo === 'ok' ? cenarios(estado.numeros, ind.empateMes) : [],
    eSe: estado.tipo === 'ok' ? eSe(estado.numeros) : [],
    atencao,
    bom,
    passos: proximos,
    cruzamentosSwot: cruzarSwot(entrada.swot),
    conquistar: comoConquistar(entrada),
  };
}

function cruzarSwot(swot: readonly SwotItem[]): Cruzamento[] {
  const primeiro = (parte: SwotItem['parte']) =>
    swot.filter((i) => i.parte === parte).sort((a, b) => a.ordem - b.ordem)[0]?.texto;
  const forca = primeiro('forcas');
  const fraqueza = primeiro('fraquezas');
  const oportunidade = primeiro('oportunidades');
  const ameaca = primeiro('ameacas');
  const lista: Cruzamento[] = [];
  if (forca && oportunidade) {
    lista.push({
      tipo: 'ataque',
      params: { forca: citar(forca), oportunidade: citar(oportunidade) },
    });
  }
  if (forca && ameaca) {
    lista.push({ tipo: 'defesa', params: { forca: citar(forca), ameaca: citar(ameaca) } });
  }
  if (fraqueza && oportunidade) {
    lista.push({
      tipo: 'melhore',
      params: { fraqueza: citar(fraqueza), oportunidade: citar(oportunidade) },
    });
  }
  if (fraqueza && ameaca) {
    lista.push({ tipo: 'evite', params: { fraqueza: citar(fraqueza), ameaca: citar(ameaca) } });
  }
  return lista;
}

/** Where to reach the persona, how they decide and what to say — from their own answers. */
function comoConquistar(entrada: Entrada): ItemConquistar[] {
  const onde =
    resposta(entrada, 'lean', 'canais') ||
    resposta(entrada, 'bmc', 'canais') ||
    resposta(entrada, 'persona', 'decide');
  const decide = resposta(entrada, 'persona', 'decide');
  const dizer =
    resposta(entrada, 'persona', 'proposta') || resposta(entrada, 'lean', 'diferencial');
  const lista: ItemConquistar[] = [];
  if (onde) lista.push({ chave: 'onde', texto: citar(onde) });
  if (decide && decide !== onde) lista.push({ chave: 'decide', texto: citar(decide) });
  if (dizer) lista.push({ chave: 'dizer', texto: citar(dizer) });
  return lista;
}

/**
 * Which of a rule's sentence variants to use: a hash of the business id and
 * the rule, so the wording is stable across renders and between the app and
 * the PDF, but differs between businesses.
 */
export function variante(negocioId: string, regra: string, quantidade: number): number {
  if (quantidade <= 1) return 0;
  let h = 0;
  for (const c of `${negocioId}:${regra}`) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h % quantidade;
}
