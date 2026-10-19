// Runs with `npm test` (node --test). A field id without copy would render the
// raw key on screen and in the PDF.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { QUADROS } from './definicoes';

const LOCALES = ['pt', 'en', 'es'] as const;

function ler(locale: string): Record<string, unknown> {
  const url = new URL(`../../core/i18n/locales/${locale}.json`, import.meta.url);
  return JSON.parse(readFileSync(url, 'utf8')) as Record<string, unknown>;
}

test('todo campo de todo quadro tem bloco, pergunta, ajuda e exemplo nos 3 idiomas', () => {
  for (const locale of LOCALES) {
    const quadros = ler(locale).quadros as Record<string, Record<string, Record<string, string>>>;
    for (const [id, definicao] of Object.entries(QUADROS)) {
      for (const campo of definicao.campos) {
        for (const texto of ['bloco', 'pergunta', 'ajuda', 'exemplo']) {
          const valor = quadros[id]?.[campo]?.[texto];
          assert.ok(valor && valor.trim(), `${locale}: quadros.${id}.${campo}.${texto}`);
        }
      }
    }
  }
});

test('Lean e BMC têm 9 campos; Persona, 6 (§5)', () => {
  assert.equal(QUADROS.lean.campos.length, 9);
  assert.equal(QUADROS.bmc.campos.length, 9);
  assert.equal(QUADROS.persona.campos.length, 6);
});
