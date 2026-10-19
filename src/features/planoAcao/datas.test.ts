// Runs with `npm test` (node --test). A reminder on the wrong day is worse
// than none.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { diaDoIso, formatarDiaCurto, isoDoDia, momentoDoLembrete } from './datas';

process.env.TZ = 'America/Sao_Paulo';

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

test('ida e volta entre Date e YYYY-MM-DD no fuso local', () => {
  assert.equal(isoDoDia(new Date(2026, 9, 28, 23, 30)), '2026-10-28');
  assert.equal(isoDoDia(diaDoIso('2026-01-05')!), '2026-01-05');
});

test('formato curto do design ("28 out")', () => {
  assert.equal(formatarDiaCurto('2026-10-28', MESES), '28 out');
  assert.equal(formatarDiaCurto('2026-12-01', MESES), '1 dez');
  assert.equal(formatarDiaCurto(null, MESES), null);
  assert.equal(formatarDiaCurto('28/10/2026', MESES), null);
});

test('lembrete às 9h do dia, hora local', () => {
  const quando = new Date(momentoDoLembrete('2026-10-28')!);
  assert.equal(quando.getDate(), 28);
  assert.equal(quando.getHours(), 9);
  assert.equal(momentoDoLembrete(null), null);
});
