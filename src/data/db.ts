// `import type` is erased at compile time, so it emits no runtime require.
import type { SQLiteDatabase } from 'expo-sqlite';
import { Platform } from 'react-native';

/**
 * Owns the database handle, the schema and the lazy load of `expo-sqlite`.
 *
 * This is the single file allowed to load `expo-sqlite` at runtime, enforced
 * by `scripts/check-invariants.mjs` (invariant 1). `expo-sqlite` resolves its
 * native module at module top level —
 *
 *   // node_modules/expo-sqlite/build/ExpoSQLite.js
 *   export default requireNativeModule('ExpoSQLite');
 *
 * — so a static `import` THROWS where the native side is absent, taking the
 * whole app down at load before any try/catch at a call site could run. (The
 * guarded call is not spelled out in prose here: the invariant check looks for
 * its first occurrence in the file and asserts a `try` opened before it.)
 *
 * Every export below degrades instead of throwing: with no database the reads
 * return empty and the writes are no-ops, so the screens still render for a
 * layout pass on web or in a stripped-down runtime.
 */

const DATABASE_NAME = 'cria.db';

/** Bump together with a new `if (current < n)` block in `migrate`. */
const SCHEMA_VERSION = 1;

function loadSQLite(): typeof import('expo-sqlite') | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-sqlite') as typeof import('expo-sqlite');
  } catch {
    return null;
  }
}

/**
 * Applies pending schema steps, tracked by SQLite's own `user_version`.
 *
 * Each step is additive and guarded by the version it upgrades from, so a
 * device that skipped releases walks through them in order.
 */
function migrate(db: SQLiteDatabase): void {
  const current =
    db.getFirstSync<{ user_version: number }>('PRAGMA user_version')?.user_version ?? 0;
  if (current >= SCHEMA_VERSION) return;

  db.withTransactionSync(() => {
    if (current < 1) {
      // Money is integer centavos everywhere (see types.ts). The CHECK
      // constraints keep a bad write out of the table rather than trusting
      // every caller. Nothing here records a purchase: the unlock is the
      // kit's entitlement flag, for every business at once.
      db.execSync(`
        CREATE TABLE IF NOT EXISTS negocios (
          id            TEXT    PRIMARY KEY NOT NULL,
          nome          TEXT    NOT NULL,
          segmento      TEXT    NOT NULL CHECK (segmento IN
                          ('alimentacao', 'beleza', 'comercio', 'servicos',
                           'moda', 'saude', 'educacao', 'outro')),
          estagio       TEXT    NOT NULL CHECK (estagio IN ('ideia', 'vendendo')),
          criado_em     INTEGER NOT NULL,
          atualizado_em INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS respostas (
          negocio_id    TEXT    NOT NULL REFERENCES negocios (id) ON DELETE CASCADE,
          quadro        TEXT    NOT NULL CHECK (quadro IN ('lean', 'bmc', 'persona')),
          campo         TEXT    NOT NULL,
          texto         TEXT    NOT NULL,
          pulada        INTEGER NOT NULL DEFAULT 0 CHECK (pulada IN (0, 1)),
          atualizado_em INTEGER NOT NULL,
          PRIMARY KEY (negocio_id, quadro, campo)
        );

        CREATE TABLE IF NOT EXISTS swot_itens (
          id         TEXT    PRIMARY KEY NOT NULL,
          negocio_id TEXT    NOT NULL REFERENCES negocios (id) ON DELETE CASCADE,
          parte      TEXT    NOT NULL CHECK (parte IN
                       ('forcas', 'fraquezas', 'oportunidades', 'ameacas')),
          texto      TEXT    NOT NULL,
          ordem      INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_swot_negocio ON swot_itens (negocio_id, parte, ordem);

        CREATE TABLE IF NOT EXISTS numeros (
          negocio_id              TEXT    PRIMARY KEY NOT NULL
                                    REFERENCES negocios (id) ON DELETE CASCADE,
          fixos_centavos          INTEGER CHECK (fixos_centavos >= 0),
          custo_unitario_centavos INTEGER CHECK (custo_unitario_centavos >= 0),
          preco_centavos          INTEGER CHECK (preco_centavos >= 0),
          dias_por_mes            INTEGER NOT NULL DEFAULT 26
                                    CHECK (dias_por_mes BETWEEN 1 AND 31),
          unidade_singular        TEXT,
          unidade_plural          TEXT,
          maior_custo             TEXT
        );

        CREATE TABLE IF NOT EXISTS tarefas (
          id             TEXT    PRIMARY KEY NOT NULL,
          negocio_id     TEXT    NOT NULL REFERENCES negocios (id) ON DELETE CASCADE,
          nome           TEXT    NOT NULL,
          data           TEXT,
          lembrete       INTEGER NOT NULL DEFAULT 0 CHECK (lembrete IN (0, 1)),
          notificacao_id TEXT,
          feita          INTEGER NOT NULL DEFAULT 0 CHECK (feita IN (0, 1)),
          origem_regra   TEXT,
          ordem          INTEGER NOT NULL,
          criado_em      INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_tarefas_negocio ON tarefas (negocio_id, feita, ordem);
      `);
    }

    db.execSync(`PRAGMA user_version = ${SCHEMA_VERSION}`);
  });
}

let handle: SQLiteDatabase | null | undefined;

/**
 * The open database, or `null` where SQLite is unavailable.
 *
 * Opened once, on first use, so a failure surfaces at the first query rather
 * than at import — which is the whole point of the lazy load.
 */
export function getDatabase(): SQLiteDatabase | null {
  if (handle !== undefined) return handle;

  const sqlite = loadSQLite();
  if (!sqlite) {
    handle = null;
    return handle;
  }

  try {
    const db = sqlite.openDatabaseSync(DATABASE_NAME);
    // Both are per-connection and must run outside a transaction. Foreign
    // keys are OFF by default in SQLite, so without this the ON DELETE
    // CASCADE above is silently ignored and deleting a business orphans its
    // answers.
    db.execSync('PRAGMA journal_mode = WAL');
    db.execSync('PRAGMA foreign_keys = ON');
    migrate(db);
    handle = db;
  } catch {
    handle = null;
  }

  return handle;
}

let preparo: Promise<void> | undefined;

/**
 * Web only (the layout preview): opens the database asynchronously, once,
 * before the first screen reads it. On web `expo-sqlite` runs in a
 * WebAssembly worker, and a synchronous call made before the worker is up
 * times out — while a retry would open a second connection and find the file
 * locked. Natively this resolves at once and `getDatabase` opens on first use.
 */
export function prepararBanco(): Promise<void> {
  if (Platform.OS !== 'web' || handle !== undefined) return Promise.resolve();
  preparo ??= (async () => {
    // expo-sqlite's web sync calls give up after ~1M `Atomics.pause()` spins —
    // a few milliseconds, which a busy worker (an OPFS flush) easily exceeds,
    // failing reads at random. Without `Atomics.pause` it falls back to its
    // long busy-wait (1e9 spins). Web preview only; native never gets here.
    try {
      Object.defineProperty(Atomics, 'pause', { value: undefined, configurable: true });
    } catch {
      // Not configurable in this engine: keep the short timeout.
    }
    const sqlite = loadSQLite();
    if (!sqlite) {
      handle = null;
      return;
    }
    try {
      const db = await sqlite.openDatabaseAsync(DATABASE_NAME);
      await db.execAsync('PRAGMA foreign_keys = ON');
      migrate(db);
      handle = db;
    } catch {
      handle = null;
    }
  })();
  return preparo;
}

/**
 * False when nothing can be stored — SQLite is absent, as on web. Surfaced in
 * Ajustes during development so empty lists are never mistaken for a bug.
 */
export function isDatabaseAvailable(): boolean {
  return getDatabase() !== null;
}

/** A fresh random id (UUID v4 shape) for a new row. */
export function novoId(): string {
  const hex = '0123456789abcdef';
  let id = '';
  for (let i = 0; i < 36; i += 1) {
    if (i === 8 || i === 13 || i === 18 || i === 23) id += '-';
    else if (i === 14) id += '4';
    else if (i === 19) id += hex[8 + Math.floor(Math.random() * 4)];
    else id += hex[Math.floor(Math.random() * 16)];
  }
  return id;
}
