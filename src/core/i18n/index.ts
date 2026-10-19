import { getLocales } from 'expo-localization';
import { I18n, type TranslateOptions } from 'i18n-js';

import en from './locales/en.json';
import es from './locales/es.json';
import pt from './locales/pt.json';

/**
 * i18n for the starter kit.
 *
 * pt-BR is both the default and the fallback locale. Every user-facing string
 * in the app must live in `locales/*.json` — no literal copy in components.
 */

export const APP_LOCALES = ['pt-BR', 'en', 'es'] as const;
export type AppLocale = (typeof APP_LOCALES)[number];

/** What the user picked in Settings. `system` follows the device locale. */
export type LocalePreference = AppLocale | 'system';

export const DEFAULT_LOCALE: AppLocale = 'pt-BR';

/** Dotted key paths of `pt.json`, so `t()` cannot be called with a typo. */
type DottedKeys<T> = T extends string
  ? never
  : {
      [K in keyof T & string]: T[K] extends string ? K : `${K}.${DottedKeys<T[K]>}`;
    }[keyof T & string];

export type TranslationKey = DottedKeys<typeof pt>;

export const i18n = new I18n(
  {
    'pt-BR': pt,
    // Alias so other Portuguese variants (pt-PT, pt-AO…) resolve to pt-BR copy.
    pt,
    en,
    es,
  },
  {
    defaultLocale: DEFAULT_LOCALE,
    locale: DEFAULT_LOCALE,
    enableFallback: true,
    missingBehavior: 'guess',
  },
);

/** Closest supported locale for the device's language list. */
export function resolveDeviceLocale(): AppLocale {
  for (const locale of getLocales()) {
    const tag = locale.languageTag?.toLowerCase() ?? '';
    const code = locale.languageCode?.toLowerCase() ?? '';

    if (tag.startsWith('pt') || code === 'pt') return 'pt-BR';
    if (tag.startsWith('es') || code === 'es') return 'es';
    if (tag.startsWith('en') || code === 'en') return 'en';
  }
  return DEFAULT_LOCALE;
}

/** Turns a stored preference into the locale actually used for lookups. */
export function resolveLocale(preference: LocalePreference): AppLocale {
  return preference === 'system' ? resolveDeviceLocale() : preference;
}

/** Sets the active locale on the shared i18n instance. */
export function applyLocale(preference: LocalePreference): AppLocale {
  const locale = resolveLocale(preference);
  i18n.locale = locale;
  return locale;
}

/** Type-safe translate. Prefer `useTranslation()` inside components. */
export function t(key: TranslationKey, options?: TranslateOptions): string {
  return i18n.t(key, options);
}

export function isAppLocale(value: string): value is AppLocale {
  return (APP_LOCALES as readonly string[]).includes(value);
}
