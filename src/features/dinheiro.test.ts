// Runs with `npm test` (node --test). A misread "6.240" turns R$ 6.240 of fixed
// costs into R$ 6,24 and the whole break-even with it.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { formatarEntrada, formatarInteiro, formatarMoedaCurta, parseDinheiro } from './dinheiro';

test('parseDinheiro lê o que se digita no Brasil', () => {
  assert.equal(parseDinheiro('6.240'), 624_000);
  assert.equal(parseDinheiro('6240'), 624_000);
  assert.equal(parseDinheiro('1.234,56'), 123_456);
  assert.equal(parseDinheiro('12'), 1_200);
  assert.equal(parseDinheiro('12,5'), 1_250);
  assert.equal(parseDinheiro('12.50'), 1_250);
  assert.equal(parseDinheiro('R$ 32'), 3_200);
  assert.equal(parseDinheiro('1.000.000'), 100_000_000);
  assert.equal(parseDinheiro(''), null);
  assert.equal(parseDinheiro('abc'), null);
});

test('formatos curtos', () => {
  assert.equal(formatarInteiro(1240), '1.240');
  assert.equal(formatarInteiro(-1240), '-1.240');
  assert.equal(formatarMoedaCurta(998_400, 'R$'), 'R$ 9.984');
  assert.equal(formatarMoedaCurta(-124_000, 'R$'), '−R$ 1.240');
  assert.equal(formatarMoedaCurta(3_250, 'R$'), 'R$ 32,50');
  assert.equal(formatarEntrada(624_000), '6.240');
  assert.equal(formatarEntrada(1_250), '12,50');
  assert.equal(formatarEntrada(null), '');
});

test('em inglês os separadores trocam de papel', async () => {
  const {
    definirLocaleNumerico,
    formatarMoedaCurta: moeda,
    parseDinheiro: ler,
  } = await import('./dinheiro');
  definirLocaleNumerico('en');
  try {
    assert.equal(moeda(998_400, '$'), '$ 9,984');
    assert.equal(moeda(3_250, '$'), '$ 32.50');
    assert.equal(ler('6,240'), 624_000);
    assert.equal(ler('12.50'), 1_250);
  } finally {
    definirLocaleNumerico('pt-BR');
  }
});
