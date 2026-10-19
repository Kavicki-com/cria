// Runs with `npm test` (node --test). The plural shows up in every number the
// person reads ("312 lanches por mês"), in the app and in the PDF.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { pluralizar } from './unidade';

test('regras do plano: ão, vogal+l, m, r/z/s e o +s', () => {
  assert.equal(pluralizar('lanche'), 'lanches');
  assert.equal(pluralizar('aula'), 'aulas');
  assert.equal(pluralizar('limão'), 'limões');
  assert.equal(pluralizar('jornal'), 'jornais');
  assert.equal(pluralizar('azul'), 'azuis');
  assert.equal(pluralizar('item'), 'itens');
  assert.equal(pluralizar('bombom'), 'bombons');
  assert.equal(pluralizar('hambúrguer'), 'hambúrgueres');
  assert.equal(pluralizar('cuscuz'), 'cuscuzes');
  assert.equal(pluralizar('mês'), 'meses');
  assert.equal(pluralizar('café'), 'cafés');
});

test('só a primeira palavra vai para o plural', () => {
  assert.equal(pluralizar('corte de cabelo'), 'cortes de cabelo');
  assert.equal(pluralizar('  bolo   de pote '), 'bolos de pote');
});

test('vazio fica vazio (a tela usa "venda/vendas" dos locales)', () => {
  assert.equal(pluralizar(''), '');
  assert.equal(pluralizar('   '), '');
});

test('os erros conhecidos da regra simples estão cobertos', () => {
  // "pão" → "pões" era o exemplo de risco do plano (§12).
  assert.equal(pluralizar('pão'), 'pães');
  assert.equal(pluralizar('Pão de mel'), 'Pães de mel');
  assert.equal(pluralizar('papel'), 'papéis');
  assert.equal(pluralizar('anel'), 'anéis');
  assert.equal(pluralizar('lençol'), 'lençóis');
  assert.equal(pluralizar('funil'), 'funis');
  assert.equal(pluralizar('fóssil'), 'fósseis');
  assert.equal(pluralizar('túnel'), 'túneis');
  assert.equal(pluralizar('lápis'), 'lápis');
  assert.equal(pluralizar('ônibus'), 'ônibus');
  assert.equal(pluralizar('tênis'), 'tênis');
});

test('regras simples de plural em inglês e espanhol', async () => {
  const { pluralizarEn, pluralizarEs } = await import('./unidade');
  assert.equal(pluralizarEn('burger'), 'burgers');
  assert.equal(pluralizarEn('class'), 'classes');
  assert.equal(pluralizarEn('candy'), 'candies');
  assert.equal(pluralizarEn('haircut session'), 'haircut sessions');
  assert.equal(pluralizarEs('hamburguesa'), 'hamburguesas');
  assert.equal(pluralizarEs('clase'), 'clases');
  assert.equal(pluralizarEs('lápiz'), 'lápices');
  assert.equal(pluralizarEs('pan'), 'panes');
});
