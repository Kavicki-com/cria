#!/usr/bin/env node
/**
 * Fails when a locale file drifts from pt-BR (the reference locale): missing
 * keys, extra keys, or a placeholder that does not appear in the translation.
 *
 * Run with `npm run i18n:check`.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const localesDir = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'src',
  'core',
  'i18n',
  'locales',
);
const REFERENCE = 'pt';
const OTHERS = ['en', 'es'];

function load(name) {
  return JSON.parse(readFileSync(join(localesDir, `${name}.json`), 'utf8'));
}

function flatten(value, prefix = '', out = new Map()) {
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (child !== null && typeof child === 'object') {
      flatten(child, path, out);
    } else {
      out.set(path, String(child));
    }
  }
  return out;
}

const placeholders = (text) => [...text.matchAll(/%\{(\w+)\}/g)].map((match) => match[1]).sort();

const reference = flatten(load(REFERENCE));
const problems = [];

for (const locale of OTHERS) {
  const entries = flatten(load(locale));

  for (const [key, referenceValue] of reference) {
    if (!entries.has(key)) {
      problems.push(`${locale}.json: missing key "${key}"`);
      continue;
    }
    const expected = placeholders(referenceValue).join(',');
    const actual = placeholders(entries.get(key)).join(',');
    if (expected !== actual) {
      problems.push(
        `${locale}.json: key "${key}" has placeholders [${actual}], expected [${expected}]`,
      );
    }
  }

  for (const key of entries.keys()) {
    if (!reference.has(key)) {
      problems.push(`${locale}.json: extra key "${key}" not present in ${REFERENCE}.json`);
    }
  }
}

if (problems.length > 0) {
  console.error('Locale check failed:\n' + problems.map((line) => `  - ${line}`).join('\n'));
  process.exit(1);
}

console.log(
  `Locale check passed: ${reference.size} keys in sync across ${[REFERENCE, ...OTHERS].join(', ')}.`,
);
