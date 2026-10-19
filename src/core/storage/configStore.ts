import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { applyLocale, type LocalePreference } from '../i18n';
import { mmkvStateStorage } from './mmkv';

/**
 * Light configuration store, persisted to MMKV.
 *
 * Holds only small scalar preferences: the cached unlock flag, locale, theme,
 * onboarding state and the rating-prompt counters. Domain data does NOT belong
 * here — each app adds its own data layer under `src/data`.
 */

export type ThemePreference = 'system' | 'light' | 'dark';

export type ConfigState = {
  /** Cached entitlement flag, so gating works instantly and offline. */
  unlocked: boolean;
  locale: LocalePreference;
  theme: ThemePreference;
  onboardingCompleted: boolean;
  /** Whether the user opted into local reminders. */
  notificationsEnabled: boolean;
  /**
   * Development-only override for the unlock flag. `null` means "use the real
   * entitlement". Lets the frontend be built against both the locked and the
   * unlocked UI without a store purchase — essential in Expo Go, where
   * purchases cannot run at all. Ignored outside `__DEV__`.
   */
  devUnlock: boolean | null;
  /** Rating prompt bookkeeping. */
  launchCount: number;
  lastRatingPromptAt: number | null;
  ratingPromptDismissedForever: boolean;

  setUnlocked: (unlocked: boolean) => void;
  setLocale: (locale: LocalePreference) => void;
  setTheme: (theme: ThemePreference) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setDevUnlock: (value: boolean | null) => void;
  registerLaunch: () => void;
  markRatingPromptShown: () => void;
  dismissRatingPromptForever: () => void;
};

const STORE_KEY = 'config-store';

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      unlocked: false,
      locale: 'system',
      theme: 'system',
      onboardingCompleted: false,
      notificationsEnabled: false,
      devUnlock: null,
      launchCount: 0,
      lastRatingPromptAt: null,
      ratingPromptDismissedForever: false,

      setUnlocked: (unlocked) => set({ unlocked }),
      setLocale: (locale) => {
        applyLocale(locale);
        set({ locale });
      },
      setTheme: (theme) => set({ theme }),
      completeOnboarding: () => set({ onboardingCompleted: true }),
      resetOnboarding: () => set({ onboardingCompleted: false }),
      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
      setDevUnlock: (devUnlock) => set({ devUnlock }),
      registerLaunch: () => set((state) => ({ launchCount: state.launchCount + 1 })),
      markRatingPromptShown: () => set({ lastRatingPromptAt: Date.now() }),
      dismissRatingPromptForever: () => set({ ratingPromptDismissedForever: true }),
    }),
    {
      name: STORE_KEY,
      storage: createJSONStorage(() => mmkvStateStorage),
      version: 1,
      partialize: (state) => ({
        unlocked: state.unlocked,
        locale: state.locale,
        theme: state.theme,
        onboardingCompleted: state.onboardingCompleted,
        notificationsEnabled: state.notificationsEnabled,
        devUnlock: state.devUnlock,
        launchCount: state.launchCount,
        lastRatingPromptAt: state.lastRatingPromptAt,
        ratingPromptDismissedForever: state.ratingPromptDismissedForever,
      }),
      onRehydrateStorage: () => (state) => {
        // Re-apply the stored locale as soon as MMKV has been read.
        applyLocale(state?.locale ?? 'system');
      },
    },
  ),
);

/** Non-reactive read, for helpers that run outside React. */
export function getConfig(): ConfigState {
  return useConfigStore.getState();
}
