import { useCallback } from 'react';
import type { TranslateOptions } from 'i18n-js';

import { useConfigStore } from '../storage/configStore';
import { i18n, resolveLocale, type AppLocale, type TranslationKey } from './index';

export type TranslateFn = (key: TranslationKey, options?: TranslateOptions) => string;

/**
 * Subscribes a component to the selected locale, so changing the language in
 * Settings re-renders every screen with the new copy.
 */
export function useTranslation(): { t: TranslateFn; locale: AppLocale } {
  const preference = useConfigStore((state) => state.locale);
  const locale = resolveLocale(preference);

  const translate = useCallback<TranslateFn>(
    (key, options) => i18n.t(key, { locale, ...options }),
    [locale],
  );

  return { t: translate, locale };
}
