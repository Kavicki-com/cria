# `src/data` — per-app data layer

This folder is intentionally empty in the starter kit. The relational/local
database is **not** part of the reusable base, because every app models
different things.

The kit only ships the light config storage (`@/core/storage`, backed by MMKV)
for the unlock flag, locale, theme and preferences. Everything list-shaped or
relational belongs here.

A typical SQLite-based layer:

```
src/data/
  db.ts            # opens the database, runs migrations
  migrations/
    001_init.ts
  repositories/
    workoutsRepository.ts
  index.ts
```

Getting started with SQLite:

```bash
npx expo install expo-sqlite
```

```ts
// src/data/db.ts
import * as SQLite from 'expo-sqlite';

let database: SQLite.SQLiteDatabase | undefined;

export async function getDatabase() {
  database ??= await SQLite.openDatabaseAsync('app.db');
  return database;
}
```

Rules of thumb:

- No network calls and no backend: this kit targets offline, single-purchase
  apps.
- Expose repositories, not raw SQL, to the rest of the app.
- `src/data` may import from `@/core`; the core must never import from here.
