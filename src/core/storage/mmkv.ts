// `import type` is erased at compile time, so it emits no runtime require.
import type { MMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

/**
 * Lightweight key/value storage for app configuration: the unlock flag, the
 * selected locale, onboarding state and user preferences.
 *
 * This is deliberately NOT the app's data layer. Anything relational or
 * list-shaped (records, history, collections) belongs in `src/data` per app,
 * typically backed by SQLite.
 */

const STORAGE_ID = 'kavicki.config';

/** The slice of MMKV this module needs — also the shape of the fallback. */
type KeyValueStorage = Pick<MMKV, 'set' | 'getString' | 'remove' | 'getAllKeys'>;

/**
 * In-memory stand-in used when MMKV is unavailable (Expo Go, unit tests).
 * It survives Fast Refresh but NOT a full reload — see `README` on Expo Go.
 */
function createEphemeralStorage(): KeyValueStorage {
  const map = new Map<string, string>();
  return {
    set: (key, value) => {
      map.set(key, String(value));
    },
    getString: (key) => map.get(key),
    remove: (key) => map.delete(key),
    getAllKeys: () => Array.from(map.keys()),
  };
}

/**
 * Loads MMKV lazily.
 *
 * This MUST stay a runtime `require` inside a try/catch: `react-native-mmkv`
 * pulls in `react-native-nitro-modules`, which calls
 * `TurboModuleRegistry.getEnforcing('NitroModules')` at module top level and
 * THROWS when Nitro is absent (Expo Go). A static `import` would therefore
 * take the whole app down before any guard could run.
 */
function loadNativeStorage(): KeyValueStorage | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createMMKV } = require('react-native-mmkv') as typeof import('react-native-mmkv');
    return createMMKV({ id: STORAGE_ID });
  } catch {
    return null;
  }
}

let instance: KeyValueStorage | undefined;
let persistent: boolean | undefined;

export function configStorage(): KeyValueStorage {
  if (!instance) {
    const native = loadNativeStorage();
    persistent = native !== null;
    instance = native ?? createEphemeralStorage();
  }
  return instance;
}

/**
 * False when preferences live in memory only and will be lost on reload —
 * i.e. the app is running in Expo Go. Surfaced in Settings during development
 * so the behaviour is never mistaken for a bug.
 */
export function isPersistentStorageAvailable(): boolean {
  if (persistent === undefined) configStorage();
  return persistent === true;
}

/** Adapter that lets Zustand's `persist` middleware write into MMKV. */
export const mmkvStateStorage: StateStorage = {
  getItem: (name) => configStorage().getString(name) ?? null,
  setItem: (name, value) => {
    configStorage().set(name, value);
  },
  removeItem: (name) => {
    configStorage().remove(name);
  },
};
