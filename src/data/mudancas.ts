/**
 * Change notifications for the plan data.
 *
 * Every write in the repositories calls `notificarMudanca()`, and screens
 * subscribe through `useSyncExternalStore`. That way a write from anywhere —
 * a modal, the dev section in Ajustes, a future restore — refreshes every
 * screen showing the data, without each caller having to remember to. Reads
 * are synchronous SQLite, so re-reading on a change is cheap.
 */

let versao = 0;
const ouvintes = new Set<() => void>();

/** Called by the repositories after every successful write. */
export function notificarMudanca(): void {
  versao += 1;
  for (const ouvinte of ouvintes) ouvinte();
}

/** `subscribe` for `useSyncExternalStore`. */
export function assinarMudancas(ouvinte: () => void): () => void {
  ouvintes.add(ouvinte);
  return () => {
    ouvintes.delete(ouvinte);
  };
}

/** `getSnapshot` for `useSyncExternalStore`: bumps on every write. */
export function versaoDosDados(): number {
  return versao;
}
