import type { PurchasesOffering } from 'react-native-purchases';
import { create } from 'zustand';

import { getConfig } from '../storage/configStore';
import {
  configurePurchases,
  fetchCustomerInfo,
  fetchUnlockOffering,
  hasUnlockEntitlement,
  pickUnlockPackage,
  purchaseUnlock,
  restoreUnlock,
  subscribeToCustomerInfo,
  type UnlockOutcome,
} from './client';

/**
 * Runtime (non-persisted) purchase state. The durable `unlocked` flag lives in
 * the config store so gating works offline and on first render.
 */

type UnlockRuntimeState = {
  /** True once the entitlement has been checked against the store at least once. */
  checked: boolean;
  checking: boolean;
  purchasing: boolean;
  restoring: boolean;
  offering: PurchasesOffering | null;

  bootstrap: () => Promise<() => void>;
  refresh: () => Promise<void>;
  purchase: () => Promise<UnlockOutcome>;
  restore: () => Promise<UnlockOutcome>;
};

export const useUnlockStore = create<UnlockRuntimeState>((set, get) => ({
  checked: false,
  checking: false,
  purchasing: false,
  restoring: false,
  offering: null,

  /**
   * Configures the SDK, syncs the cached flag and starts listening for
   * entitlement changes. Returns the unsubscribe function.
   */
  bootstrap: async () => {
    const ready = await configurePurchases();
    if (!ready) {
      set({ checked: true });
      return () => {};
    }

    const unsubscribe = subscribeToCustomerInfo((info) => {
      getConfig().setUnlocked(hasUnlockEntitlement(info));
    });

    await get().refresh();
    return unsubscribe;
  },

  refresh: async () => {
    if (get().checking) return;
    set({ checking: true });

    try {
      const [info, offering] = await Promise.all([fetchCustomerInfo(), fetchUnlockOffering()]);
      if (info) {
        getConfig().setUnlocked(hasUnlockEntitlement(info));
      }
      set({ offering });
    } finally {
      set({ checking: false, checked: true });
    }
  },

  purchase: async () => {
    if (get().purchasing) return { status: 'error', detail: 'already-in-flight' };
    set({ purchasing: true });

    try {
      const offering = get().offering ?? (await fetchUnlockOffering());
      const outcome = await purchaseUnlock(pickUnlockPackage(offering));
      if (outcome.status === 'unlocked') {
        getConfig().setUnlocked(true);
      }
      return outcome;
    } finally {
      set({ purchasing: false });
    }
  },

  restore: async () => {
    if (get().restoring) return { status: 'error', detail: 'already-in-flight' };
    set({ restoring: true });

    try {
      const outcome = await restoreUnlock();
      if (outcome.status === 'unlocked') {
        getConfig().setUnlocked(true);
      }
      return outcome;
    } finally {
      set({ restoring: false });
    }
  },
}));
