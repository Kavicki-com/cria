# `src/features` — per-app domain code

This folder is intentionally empty in the starter kit. Each app adds its own
feature modules here, one folder per domain slice:

```
src/features/
  workouts/
    components/
    hooks/
    screens/
    workoutsStore.ts   # Zustand store for this slice
    types.ts
    index.ts           # public surface of the slice
```

Rules of thumb:

- A feature may import from `@/core` and `@/data`. The core must **never**
  import from `src/features` — that is what keeps the kit reusable.
- Keep every user-facing string in `src/core/i18n/locales/*.json`. Add new keys
  under a scope named after the feature (e.g. `workouts.title`).
- Gate paid features with `useUnlock()` / `useGate()` from `@/core/purchases`,
  or render `<LockedNotice />` from `@/core/paywall`.
- Routes live in `src/app`. A route file should be thin and delegate to a
  screen exported from the feature.
