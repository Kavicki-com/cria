/**
 * Resolution hooks for `npm test` (node --test over src/**\/*.test.ts).
 *
 * Node runs the TypeScript itself (type stripping), but resolves imports the
 * ESM way: no extension guessing and no `@/` alias. The app's code is written
 * for Metro, which does both. Rather than spell `.ts` into every import of the
 * pure modules — which the app's tsconfig would then have to allow — these
 * hooks give the tests Metro's two conveniences:
 *
 *   './calculo'    -> './calculo.ts' (or './calculo/index.ts')
 *   '@/features/x' -> '<root>/src/features/x'
 *
 * Only pure modules belong under test (no React Native, no Expo): anything
 * that reaches a native package fails here exactly as it should.
 */
import { existsSync, statSync } from 'node:fs';
import { register } from 'node:module';
import { dirname, join, resolve as resolvePath } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const src = join(dirname(fileURLToPath(import.meta.url)), '..', 'src');

function candidato(base) {
  if (existsSync(base) && statSync(base).isFile()) return base;
  for (const ext of ['.ts', '.tsx']) if (existsSync(base + ext)) return base + ext;
  for (const index of ['index.ts', 'index.tsx']) {
    const path = join(base, index);
    if (existsSync(path)) return path;
  }
  return null;
}

export async function resolve(specifier, context, nextResolve) {
  let base = null;
  if (specifier.startsWith('@/')) base = join(src, specifier.slice(2));
  else if ((specifier.startsWith('./') || specifier.startsWith('../')) && context.parentURL) {
    base = resolvePath(dirname(fileURLToPath(context.parentURL)), specifier);
  }
  const path = base ? candidato(base) : null;
  if (path) return nextResolve(pathToFileURL(path).href, context);
  return nextResolve(specifier, context);
}

if (!process.env.__CRIA_TEST_HOOKS) {
  process.env.__CRIA_TEST_HOOKS = '1';
  register(import.meta.url);
}
