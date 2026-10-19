import { useCallback } from 'react';

import { pushOnce } from '../navigation';
import { getConfig } from '../storage/configStore';
import { useUnlock } from './useUnlock';

/** Where the generic paywall lives. Keep in sync with `src/app/paywall.tsx`. */
export const PAYWALL_PATHNAME = '/paywall' as const;

/**
 * Non-reactive check, for use outside React (event handlers, helpers).
 *
 * Must resolve the same way `useUnlock` does, __DEV__ override included. It
 * used to read `unlocked` alone, so with "Simulate unlock" on the tab icons
 * dropped their padlock (they read `useUnlock`) while the tab press still
 * went to the paywall (it read this) — the screen could not be reached.
 */
export function isUnlocked(): boolean {
  const { unlocked, devUnlock } = getConfig();
  return __DEV__ && devUnlock !== null ? devUnlock : unlocked;
}

/** Opens the paywall as a modal. `source` only tags where the user came from. */
export function openPaywall(source?: string): void {
  pushOnce({ pathname: PAYWALL_PATHNAME, params: source ? { source } : undefined });
}

export type Gate = {
  unlocked: boolean;
  /**
   * Runs `action` when unlocked; otherwise opens the paywall.
   * Returns whether the action ran, so callers can bail out early.
   *
   * ```ts
   * const { requireUnlock } = useGate();
   * <Button onPress={() => requireUnlock(exportPdf)} />
   * ```
   */
  requireUnlock: (action?: () => void, source?: string) => boolean;
};

export function useGate(source?: string): Gate {
  const { unlocked } = useUnlock();

  const requireUnlock = useCallback(
    (action?: () => void, overrideSource?: string) => {
      if (!unlocked) {
        openPaywall(overrideSource ?? source);
        return false;
      }
      action?.();
      return true;
    },
    [unlocked, source],
  );

  return { unlocked, requireUnlock };
}
