// Runs with `npm test` (node --test). The PDF is what leaves the app: no raw
// key, no "undefined", no broken HTML from what the person typed, and exactly
// nine A4 pages.
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
import { analisar } from '../analise/analisar';
import { calcularProgresso } from '../negocios/progresso';
import { montarDocumento } from './montar';
import type { DadosDocumento, Traduzir } from './tipos';

process.env.TZ = 'America/Sao_Paulo';

function tradutor(locale: string): Traduzir {
  const url = new URL(`../../core/i18n/locales/${locale}.json`, import.meta.url);
  const json = JSON.parse(readFileSync(url, 'utf8')) as Record<string, unknown>;
  return (chave, params = {}) => {
    let valor: unknown = json;
    for (const parte of chave.split('.'))
      valor = (valor as Record<string, unknown> | undefined)?.[parte];
    if (typeof valor !== 'string') return `[missing "${chave}"]`;
    return valor.replace(/%\{(\w+)\}/g, (_, nome: string) =>
      nome in params ? String(params[nome]) : `[missing "${nome}"]`,
    );
  };
}

function respostas(valores: Partial<Record<Quadro, Record<string, string>>>): RespostasPorQuadro {
  const r: RespostasPorQuadro = { lean: {}, bmc: {}, persona: {} };
  for (const quadro of ['lean', 'bmc', 'persona'] as const) {
    for (const [campo, texto] of Object.entries(valores[quadro] ?? {})) {
      r[quadro][campo] = { quadro, campo, texto, pulada: false, atualizadoEm: 0 };
    }
  }
  return r;
}

const negocio: Negocio = {
  id: 'n1',
  nome: 'Lanches da Vila',
  segmento: 'alimentacao',
  estagio: 'vendendo',
  criadoEm: 0,
  atualizadoEm: 0,
};

const swot: SwotItem[] = (
  [
    ['forcas', 'Receita própria de molho'],
    ['fraquezas', 'Só uma pessoa na cozinha'],
    ['oportunidades', 'Mais gente trabalhando de casa'],
    ['ameacas', 'Alta no preço da carne'],
  ] as const
).map(([parte, texto], ordem) => ({ id: parte, parte, texto, ordem }));

const tarefa = (nome: string, data: string | null, feita = false): Tarefa => ({
  id: nome,
  negocioId: 'n1',
  nome,
  data,
  lembrete: false,
  notificacaoId: null,
  feita,
  origemRegra: null,
  ordem: 0,
  criadoEm: new Date(2026, 9, 1).getTime(),
});

function dados(sobrescrever: Partial<DadosDocumento> = {}): DadosDocumento {
  const base = {
    negocio,
    respostas: respostas({
      lean: {
        problema: 'No bairro só tem lanche de rede.',
        diferencial: 'Lanche artesanal que chega quente em 25 minutos.',
        custos: 'Aluguel, insumos, gás.',
      },
      persona: { quem: 'Carla, 34 anos', proposta: 'Lanche quente em 25 minutos.' },
    }),
    swot,
    numeros: {
      ...NUMEROS_VAZIOS,
      fixos: 624_000,
      custoUnitario: 1_200,
      preco: 3_200,
      maiorCusto: 'carne',
    },
    tarefas: [
      tarefa('Abrir o MEI', '2026-10-10', true),
      tarefa('Fechar fornecedor de pão', '2026-10-28'),
    ],
    unidade: { singular: 'lanche', plural: 'lanches' },
    ilustracao: 'mulher' as const,
    hoje: new Date(2026, 9, 19).getTime(),
    locale: 'pt-BR',
    ...sobrescrever,
  };
  return {
    ...base,
    analise: analisar(base),
    progresso: calcularProgresso(base),
  } as DadosDocumento;
}

test('9 páginas, 2 em paisagem, com o nome do negócio', () => {
  const html = montarDocumento(dados(), tradutor('pt'), '');
  assert.equal(html.match(/<section class="pagina/g)?.length, 9);
  assert.equal(html.match(/<section class="pagina paisagem/g)?.length, 2);
  assert.ok(html.includes('Lanches da Vila'));
  assert.ok(html.includes('Outubro de 2026'));
});

test('nenhuma chave i18n crua, nenhum undefined, nenhum NaN', () => {
  for (const locale of ['pt', 'en', 'es']) {
    const html = montarDocumento(dados({ locale }), tradutor(locale), '');
    assert.ok(!html.includes('[missing'), `${locale}: ${html.match(/\[missing "[^"]+"\]/)?.[0]}`);
    assert.ok(!/undefined|NaN|null/.test(html.replace(/<style>[\s\S]*?<\/style>/, '')), locale);
    assert.ok(!html.includes('%{'), locale);
  }
});

test('os números do §7 chegam ao documento', () => {
  const html = montarDocumento(dados(), tradutor('pt'), '');
  for (const trecho of [
    '312',
    '62,5%',
    'R$ 9.984',
    '− R$ 1.240',
    '+ R$ 1.760',
    '+ R$ 3.760',
    'R$ 34',
    '284 / mês',
    '347 / mês',
    '362 / mês',
  ]) {
    assert.ok(html.includes(trecho), trecho);
  }
});

test('campos pulados aparecem como "—" ou "A definir", sem quebrar', () => {
  const html = montarDocumento(
    dados({ respostas: respostas({}), swot: [], tarefas: [], numeros: NUMEROS_VAZIOS }),
    tradutor('pt'),
    '',
  );
  assert.ok(html.includes('class="vazio">—'));
  assert.ok(html.includes('A definir'));
  assert.equal(html.match(/<section class="pagina/g)?.length, 9);
  assert.ok(!html.includes('[missing'));
});

test('o que a pessoa digitou é escapado', () => {
  const html = montarDocumento(
    dados({ negocio: { ...negocio, nome: '<script>alert(1)</script> & "Cia"' } }),
    tradutor('pt'),
    '',
  );
  assert.ok(!html.includes('<script>alert'));
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt; &amp; &quot;Cia&quot;'));
});

test('as fontes embutidas entram no <style>', () => {
  const html = montarDocumento(dados(), tradutor('pt'), '@font-face{font-family:"Poppins"}');
  assert.ok(html.includes('@font-face{font-family:"Poppins"}'));
});
