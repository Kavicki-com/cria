import { useEffect } from 'react';

import { useConfigStore } from '../storage/configStore';
import {
  isPurchasesNativeAvailable,
  isPurchasesUsable,
  pickUnlockPackage,
  type UnlockOutcome,
} from './client';
import { useUnlockStore } from './unlockStore';

export type UseUnlock = {
  /** The single source of truth for gating. Cached, so it works offline. */
  unlocked: boolean;
  /** True until the entitlement has been checked against the store once. */
  checking: boolean;
  purchasing: boolean;
  restoring: boolean;
  /** False when billing cannot run: no native module (Expo Go) or no key. */
  purchasesConfigured: boolean;
  /** False specifically in Expo Go, where the RevenueCat module is absent. */
  purchasesNativeAvailable: boolean;
  /** True when `unlocked` comes from the __DEV__ override, not the store. */
  unlockForcedByDev: boolean;
  /** Localized price string from the store, e.g. "R$ 19,90". */
  price: string | null;
  /** True when the store returned no usable package. */
  offeringUnavailable: boolean;
  refresh: () => Promise<void>;
  purchase: () => Promise<UnlockOutcome>;
  restore: () => Promise<UnlockOutcome>;
};

/**
 * Everything a screen needs to know about the one-time unlock.
 *
 * ```tsx
 * const { unlocked } = useUnlock();
 * if (!unlocked) return <LockedNotice />;
 * ```
 */
export function useUnlock(): UseUnlock {
  const realUnlocked = useConfigStore((state) => state.unlocked);
  const devUnlock = useConfigStore((state) => state.devUnlock);

  // The override exists only in development builds; production always reads
  // the real cached entitlement.
  const forced = __DEV__ && devUnlock !== null;
  const unlocked = forced ? (devUnlock as boolean) : realUnlocked;

  const checked = useUnlockStore((state) => state.checked);
  const checking = useUnlockStore((state) => state.checking);
  const purchasing = useUnlockStore((state) => state.purchasing);
  const restoring = useUnlockStore((state) => state.restoring);
  const offering = useUnlockStore((state) => state.offering);
  const refresh = useUnlockStore((state) => state.refresh);
  const purchase = useUnlockStore((state) => state.purchase);
  const restore = useUnlockStore((state) => state.restore);

  const purchasesConfigured = isPurchasesUsable();
  const unlockPackage = pickUnlockPackage(offering);

  return {
    unlocked,
    purchasesNativeAvailable: isPurchasesNativeAvailable(),
    unlockForcedByDev: forced,
    checking: checking || !checked,
    purchasing,
    restoring,
    purchasesConfigured,
    price: unlockPackage?.product.priceString ?? null,
    offeringUnavailable: purchasesConfigured && checked && !unlockPackage,
    refresh,
    purchase,
    restore,
  };
}

/**
 * Configures RevenueCat and keeps the cached flag in sync. Mount once, from the
 * root layout.
 */
export function usePurchasesBootstrap(): void {
  const bootstrap = useUnlockStore((state) => state.bootstrap);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    bootstrap().then((cleanup) => {
      if (cancelled) {
        cleanup();
        return;
      }
      unsubscribe = cleanup;
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [bootstrap]);
}
