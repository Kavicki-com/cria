import Constants from 'expo-constants';
import { useState } from 'react';
import { Linking } from 'react-native';

import { env } from '../config';
import { Badge, Screen, SettingsRow, SettingsSection, Text } from '../components';
import { APP_LOCALES, type LocalePreference, type TranslationKey } from '../i18n';
import { useTranslation } from '../i18n/useTranslation';
import { useNotificationPermission } from '../notifications';
import { openPaywall, useUnlock } from '../purchases';
import { useRatingPrompt } from '../rating';
import { isPersistentStorageAvailable, useConfigStore, type ThemePreference } from '../storage';

/**
 * Reusable Settings screen: language, appearance, local reminders, restore
 * purchase and the about block. Every label comes from the `settings.*` scope.
 *
 * Apps can render extra rows below by passing `children`.
 */

const LOCALE_PREFERENCES: readonly LocalePreference[] = ['system', ...APP_LOCALES];
const THEME_PREFERENCES: readonly ThemePreference[] = ['system', 'light', 'dark'];

function localeLabelKey(preference: LocalePreference): TranslationKey {
  return preference === 'system' ? 'language.system' : (`language.${preference}` as TranslationKey);
}

function themeLabelKey(preference: ThemePreference): TranslationKey {
  return `theme.${preference}` as TranslationKey;
}

/** Cycles through a list of options, so Settings needs no extra picker screen. */
function nextIn<T>(options: readonly T[], current: T): T {
  const index = options.indexOf(current);
  return options[(index + 1) % options.length] ?? current;
}

export type SettingsScreenProps = {
  /** Extra app-specific rows, rendered after the built-in sections. */
  children?: React.ReactNode;
};

export function SettingsScreen({ children }: SettingsScreenProps) {
  const { t } = useTranslation();

  const localePreference = useConfigStore((state) => state.locale);
  const setLocale = useConfigStore((state) => state.setLocale);
  const themePreference = useConfigStore((state) => state.theme);
  const setTheme = useConfigStore((state) => state.setTheme);

  const setNotificationsEnabled = useConfigStore((state) => state.setNotificationsEnabled);

  const { unlocked, restoring, restore, purchasesConfigured } = useUnlock();
  const devUnlock = useConfigStore((state) => state.devUnlock);
  const setDevUnlock = useConfigStore((state) => state.setDevUnlock);
  const notifications = useNotificationPermission();
  const { rateNow } = useRatingPrompt();

  const [messageKey, setMessageKey] = useState<TranslationKey | null>(null);

  const version = Constants.expoConfig?.version ?? '—';

  async function onRestore() {
    setMessageKey(null);
    const outcome = await restore();
    setMessageKey(
      outcome.status === 'unlocked'
        ? 'paywall.restoreSuccess'
        : outcome.status === 'nothing-to-restore'
          ? 'paywall.restoreNone'
          : outcome.status === 'not-configured'
            ? 'paywall.notConfiguredBody'
            : outcome.status === 'native-unavailable'
              ? 'paywall.nativeUnavailableBody'
              : 'paywall.restoreError',
    );
  }

  async function onToggleNotifications(next: boolean) {
    setMessageKey(null);

    if (!next) {
      // Turning the toggle off only stops the app from scheduling: the OS
      // permission itself can only be revoked in the system settings.
      setNotificationsEnabled(false);
      return;
    }

    const granted = await notifications.request();
    if (!granted) {
      setMessageKey('notifications.permissionBody');
    }
  }

  async function openLink(url: string) {
    if (!url) return;
    await Linking.openURL(url);
  }

  async function onSupport() {
    if (!env.links.supportEmail) {
      setMessageKey('settings.supportUnavailable');
      return;
    }
    await Linking.openURL(`mailto:${env.links.supportEmail}`);
  }

  async function onRate() {
    setMessageKey(null);
    const outcome = await rateNow();
    if (outcome === 'not-configured') {
      setMessageKey('rating.notConfigured');
    } else if (outcome === 'unavailable') {
      setMessageKey('rating.unavailable');
    }
  }

  return (
    <Screen scroll edgeToEdgeBottom>
      <Text variant="title">{t('settings.title')}</Text>

      <SettingsSection title={t('settings.sectionGeneral')}>
        <SettingsRow
          label={t('settings.language')}
          value={t(localeLabelKey(localePreference))}
          onPress={() => setLocale(nextIn(LOCALE_PREFERENCES, localePreference))}
        />
        <SettingsRow
          label={t('settings.theme')}
          value={t(themeLabelKey(themePreference))}
          onPress={() => setTheme(nextIn(THEME_PREFERENCES, themePreference))}
        />
        <SettingsRow
          label={t('settings.notifications')}
          hint={
            notifications.available
              ? t('settings.notificationsHint')
              : t('notifications.unavailable')
          }
          switchValue={notifications.enabled}
          onSwitchChange={(next) => void onToggleNotifications(next)}
          disabled={notifications.status === 'loading' || !notifications.available}
        />
        {notifications.blocked ? (
          <SettingsRow
            label={t('notifications.openSettings')}
            hint={t('notifications.permissionBody')}
            onPress={() => void notifications.openSettings()}
          />
        ) : null}
      </SettingsSection>

      <SettingsSection title={t('settings.sectionPurchase')}>
        <SettingsRow
          label={t('settings.unlockStatus')}
          value={unlocked ? t('status.unlocked') : t('status.locked')}
        />
        {unlocked ? null : (
          <SettingsRow label={t('settings.unlockCta')} onPress={() => openPaywall('settings')} />
        )}
        <SettingsRow
          label={restoring ? t('paywall.restoring') : t('settings.restorePurchase')}
          hint={t('settings.restorePurchaseHint')}
          onPress={() => void onRestore()}
          disabled={restoring || !purchasesConfigured}
        />
      </SettingsSection>

      <SettingsSection title={t('settings.sectionAbout')}>
        <SettingsRow label={t('settings.version')} value={version} />
        <SettingsRow label={t('settings.rateApp')} onPress={() => void onRate()} />
        {env.links.privacyUrl ? (
          <SettingsRow
            label={t('settings.privacy')}
            onPress={() => void openLink(env.links.privacyUrl)}
          />
        ) : null}
        {env.links.termsUrl ? (
          <SettingsRow
            label={t('settings.terms')}
            onPress={() => void openLink(env.links.termsUrl)}
          />
        ) : null}
        <SettingsRow label={t('settings.support')} onPress={() => void onSupport()} />
      </SettingsSection>

      {/*
        Development-only controls. `__DEV__` is false in release builds, so this
        whole block is dropped from production bundles.
      */}
      {__DEV__ ? (
        <SettingsSection title={t('settings.sectionDev')}>
          <SettingsRow
            label={t('settings.devUnlock')}
            hint={t('settings.devUnlockHint')}
            switchValue={devUnlock === true}
            onSwitchChange={(next) => setDevUnlock(next ? true : null)}
          />
          {!isPersistentStorageAvailable() ? (
            <SettingsRow label={t('settings.storageEphemeral')} />
          ) : null}
        </SettingsSection>
      ) : null}

      {children}

      {messageKey ? (
        <Text variant="caption" color="textMuted">
          {t(messageKey)}
        </Text>
      ) : null}

      {!purchasesConfigured ? (
        <Badge label={t('paywall.notConfiguredTitle')} tone="warning" />
      ) : null}
    </Screen>
  );
}
