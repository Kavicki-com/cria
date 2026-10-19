// Runs with `npm test` (node --test). The analysis goes into the PDF the person
// takes to the bank: the plan's fixture (§7) has to match to the unit, and
// every rule has a case where it fires and one where it does not.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import {
  NUMEROS_VAZIOS,
  type Negocio,
  type Quadro,
  type RespostasPorQuadro,
  type SwotItem,
  type Tarefa,
} from '../../data/types';
import {
  analisar,
  aplicarRegras,
  ID_REGRAS,
  variante,
  type Entrada,
  type IdRegra,
} from './analisar';
import { arredondarRedondo, arredondarVendas } from './numeros';

const negocio: Negocio = {
  id: 'lanches-da-vila',
  nome: 'Lanches da Vila',
  segmento: 'alimentacao',
  estagio: 'vendendo',
  criadoEm: 0,
  atualizadoEm: 0,
};

function respostas(valores: Partial<Record<Quadro, Record<string, string>>>): RespostasPorQuadro {
  const r: RespostasPorQuadro = { lean: {}, bmc: {}, persona: {} };
  for (const quadro of ['lean', 'bmc', 'persona'] as const) {
    for (const [campo, texto] of Object.entries(valores[quadro] ?? {})) {
      r[quadro][campo] = { quadro, campo, texto, pulada: false, atualizadoEm: 0 };
    }
  }
  return r;
}

const swot = (itens: [SwotItem['parte'], string][]): SwotItem[] =>
  itens.map(([parte, texto], ordem) => ({ id: `${parte}${ordem}`, parte, texto, ordem }));

const tarefa: Tarefa = {
  id: 't',
  negocioId: negocio.id,
  nome: 'Abrir o MEI',
  data: null,
  lembrete: false,
  notificacaoId: null,
  feita: false,
  origemRegra: null,
  ordem: 0,
  criadoEm: 0,
};

/** The plan's fixture: R$ 6.240 fixed, R$ 12 cost, R$ 32 price; canais left open. */
const lanchesDaVila: Entrada = {
  negocio,
  respostas: respostas({
    lean: {
      problema: 'No bairro só tem lanche de rede, caro e demorado no delivery.',
      paraQuem: 'Famílias e quem trabalha de casa, num raio de 3 km.',
      diferencial: 'Lanche artesanal que chega quente em 25 minutos.',
      metricas: 'Lanches vendidos por mês.',
    },
    persona: {
      quem: 'Carla, 34 anos',
      rotina: 'Mora a 1 km, trabalha de casa',
      quer: 'Jantar gostoso sem cozinhar',
      incomoda: 'Entrega que atrasa',
      decide: 'Indicação de vizinhos e grupo do condomínio',
      proposta: 'Lanche artesanal que chega quente em 25 minutos, sem a demora das grandes redes.',
    },
  }),
  swot: swot([
    ['forcas', 'Receita própria de molho'],
    ['forcas', 'Entrega rápida, raio curto'],
    ['fraquezas', 'Só uma pessoa na cozinha'],
    ['oportunidades', 'Mais gente trabalhando de casa'],
    ['ameacas', 'Alta no preço da carne'],
  ]),
  numeros: {
    ...NUMEROS_VAZIOS,
    fixos: 624_000,
    custoUnitario: 1_200,
    preco: 3_200,
    unidadeSingular: 'lanche',
    maiorCusto: 'carne',
  },
  tarefas: [tarefa],
  unidade: { singular: 'lanche', plural: 'lanches' },
};

test('Lanches da Vila: indicadores do §7', () => {
  const a = analisar(lanchesDaVila);
  assert.ok(a.indicadores);
  assert.equal(a.indicadores.margemUnit, 2_000);
  assert.equal(a.indicadores.margemPct, 62.5);
  assert.equal(a.indicadores.empateMes, 312);
  assert.equal(a.indicadores.empateDia, 12);
  assert.equal(a.indicadores.faturamentoEmpate, 998_400);
  assert.equal(a.indicadores.sensibilidadeCusto, 17);
  assert.equal(a.indicadores.minutosPorVenda, 40);
});

test('Lanches da Vila: cenários 250 / 400 / 500 → −1.240 / +1.760 / +3.760', () => {
  const a = analisar(lanchesDaVila);
  assert.deepEqual(
    a.cenarios.map((c) => [c.vendas, c.faturamento, c.resultado]),
    [
      [250, 800_000, -124_000],
      [400, 1_280_000, 176_000],
      [500, 1_600_000, 376_000],
    ],
  );
});

test('Lanches da Vila: "e se…" 34 / 14 / +1.000 → 284 / 347 / 362', () => {
  const a = analisar(lanchesDaVila);
  assert.deepEqual(
    a.eSe.map((e) => [e.chave, e.valor, e.novoEmpate]),
    [
      ['preco', 3_400, 284],
      ['custo', 1_400, 347],
      ['fixos', 100_000, 362],
    ],
  );
});

test('Lanches da Vila: atenção, o que está bom e passos do design Analise', () => {
  const a = analisar(lanchesDaVila);
  assert.deepEqual(
    a.atencao.map((x) => x.regra),
    ['canais_vazios', 'custo_dominante', 'capacidade'],
  );
  assert.deepEqual(
    a.bom.map((x) => x.regra),
    ['margem_boa', 'proposta_mensuravel'],
  );
  assert.deepEqual(
    a.passos.map((p) => p.regra),
    ['canais_vazios', 'custo_dominante', 'capacidade'],
  );
  assert.equal(a.atencao[1]!.params.maiorCusto, 'carne');
  assert.equal(a.atencao[2]!.params.fraqueza, 'Só uma pessoa na cozinha');
});

test('cruzamentos do SWOT e "como conquistar"', () => {
  const a = analisar(lanchesDaVila);
  assert.deepEqual(
    a.cruzamentosSwot.map((c) => c.tipo),
    ['ataque', 'defesa', 'melhore', 'evite'],
  );
  assert.equal(a.cruzamentosSwot[0]!.params.forca, 'Receita própria de molho');
  assert.deepEqual(
    a.conquistar.map((c) => c.chave),
    ['onde', 'dizer'],
  );
});

test('arredondamentos', () => {
  assert.equal(arredondarVendas(249.6), 250);
  assert.equal(arredondarVendas(405.6), 400);
  assert.equal(arredondarVendas(32), 30);
  assert.equal(arredondarVendas(0.4), 1);
  assert.equal(arredondarRedondo(192), 200);
  assert.equal(arredondarRedondo(180), 200);
  assert.equal(arredondarRedondo(93_600), 100_000);
  assert.equal(arredondarRedondo(30), 20);
});

test('cenários de um negócio pequeno não viram zero', () => {
  const a = analisar({
    ...lanchesDaVila,
    numeros: { ...NUMEROS_VAZIOS, fixos: 200_000, custoUnitario: 2_000, preco: 7_000 },
  });
  assert.equal(a.indicadores?.empateMes, 40);
  assert.ok(a.cenarios.every((c) => c.vendas > 0));
});

function dispara(entrada: Entrada, regra: IdRegra): boolean {
  const { achados, passos } = aplicarRegras(entrada);
  return achados.some((a) => a.regra === regra) || passos.some((p) => p.regra === regra);
}

const vazio: Entrada = {
  ...lanchesDaVila,
  respostas: respostas({}),
  swot: [],
  numeros: NUMEROS_VAZIOS,
  tarefas: [],
};

test('cada regra dispara e deixa de disparar', () => {
  const casos: [IdRegra, Entrada, Entrada][] = [
    ['sem_numeros', vazio, lanchesDaVila],
    [
      'canais_vazios',
      lanchesDaVila,
      { ...lanchesDaVila, respostas: respostas({ lean: { canais: 'Instagram' } }) },
    ],
    [
      'margem_baixa',
      { ...lanchesDaVila, numeros: { ...lanchesDaVila.numeros, custoUnitario: 2_500 } },
      lanchesDaVila,
    ],
    [
      'custo_dominante',
      lanchesDaVila,
      { ...lanchesDaVila, numeros: { ...lanchesDaVila.numeros, maiorCusto: null } },
    ],
    [
      'capacidade',
      lanchesDaVila,
      { ...lanchesDaVila, swot: swot([['fraquezas', 'Pouco dinheiro']]) },
    ],
    [
      'empate_alto',
      { ...lanchesDaVila, numeros: { ...lanchesDaVila.numeros, fixos: 4_000_000 } },
      lanchesDaVila,
    ],
    [
      'ideia_sem_validacao',
      { ...vazio, negocio: { ...negocio, estagio: 'ideia' } },
      { ...lanchesDaVila, negocio: { ...negocio, estagio: 'ideia' } },
    ],
    ['proposta_vaga', vazio, lanchesDaVila],
    [
      'swot_desequilibrado',
      {
        ...lanchesDaVila,
        swot: swot([
          ['fraquezas', 'a'],
          ['ameacas', 'b'],
          ['ameacas', 'c'],
        ]),
      },
      lanchesDaVila,
    ],
    [
      'persona_sem_decisao',
      { ...lanchesDaVila, respostas: respostas({ persona: { quem: 'Carla' } }) },
      vazio,
    ],
    ['margem_boa', lanchesDaVila, vazio],
    ['proposta_mensuravel', lanchesDaVila, vazio],
    ['cliente_definido', lanchesDaVila, vazio],
    ['sem_tarefas', vazio, lanchesDaVila],
  ];
  for (const [regra, sim, nao] of casos) {
    assert.equal(dispara(sim, regra), true, `${regra} deveria disparar`);
    assert.equal(dispara(nao, regra), false, `${regra} não deveria disparar`);
  }
  assert.equal(casos.length, ID_REGRAS.length, 'toda regra tem caso');
});

test('toda regra tem título e texto nos 3 idiomas', () => {
  for (const locale of ['pt', 'en', 'es']) {
    const url = new URL(`../../core/i18n/locales/${locale}.json`, import.meta.url);
    const json = JSON.parse(readFileSync(url, 'utf8')) as {
      analise: { regras: Record<string, Record<string, string>> };
    };
    for (const id of ID_REGRAS) {
      const r = json.analise.regras[id];
      assert.ok(r, `${locale}: analise.regras.${id}`);
      assert.ok(r.titulo || id === 'sem_tarefas', `${locale}: ${id}.titulo`);
      assert.ok(r.texto || id === 'sem_tarefas', `${locale}: ${id}.texto`);
    }
  }
});

test('a variante da frase é estável por negócio e regra', () => {
  assert.equal(variante('a', 'canais_vazios', 2), variante('a', 'canais_vazios', 2));
  assert.equal(variante('a', 'x', 1), 0);
});
