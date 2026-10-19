// Runs with `npm test` (node --test). These are the numbers the person takes to
// the bank; the fixture is the plan's "Lanches da Vila" (§7).
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { NUMEROS_VAZIOS } from '../../data/types';
import { avaliarNumeros, calcularIndicadores, empate } from './calculo';

const lanchesDaVila = { fixos: 624_000, custoUnitario: 1_200, preco: 3_200, diasPorMes: 26 };

test('Lanches da Vila: margem, empate, faturamento e sensibilidade do §7', () => {
  const i = calcularIndicadores(lanchesDaVila);
  assert.equal(i.margemUnit, 2_000);
  assert.equal(i.margemPct, 62.5);
  assert.equal(i.empateMes, 312);
  assert.equal(i.empateDia, 12);
  assert.equal(i.faturamentoEmpate, 998_400);
  assert.equal(i.sensibilidadeCusto, 17);
});

test('empate arredonda para cima', () => {
  assert.equal(empate(10_000, 0, 3_000), 4);
  assert.equal(empate(9_000, 0, 3_000), 3);
});

test('sensibilidade some quando +R$ 1 encosta no preço', () => {
  const i = calcularIndicadores({
    fixos: 100_000,
    custoUnitario: 900,
    preco: 1_000,
    diasPorMes: 26,
  });
  assert.equal(i.sensibilidadeCusto, null);
});

test('avaliarNumeros: incompleto, não fecha e ok', () => {
  assert.deepEqual(avaliarNumeros(NUMEROS_VAZIOS), { tipo: 'incompleto' });
  assert.deepEqual(
    avaliarNumeros({ ...NUMEROS_VAZIOS, fixos: 100_000, custoUnitario: 2_000, preco: 2_000 }),
    { tipo: 'nao-fecha' },
  );
  const ok = avaliarNumeros({ ...NUMEROS_VAZIOS, ...lanchesDaVila });
  assert.equal(ok.tipo, 'ok');
});
