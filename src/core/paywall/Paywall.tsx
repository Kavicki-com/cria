import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { Badge, Button, Card, Screen, Text } from '../components';
import { useTranslation } from '../i18n/useTranslation';
import type { TranslationKey } from '../i18n';
import { useUnlock } from '../purchases';
import type { UnlockOutcome } from '../purchases';
import { useTheme } from '../theme';

/**
 * Generic paywall for a single non-consumable unlock.
 *
 * All copy comes from `locales/*.json` under the `paywall.*` scope, so an app
 * customizes it by editing translations — not this component.
 */

export type PaywallProps = {
  /** Called after a successful purchase or restore. Usually closes the modal. */
  onUnlocked?: () => void;
  /** Rendered as a dismiss button when provided. */
  onDismiss?: () => void;
};

const BENEFIT_KEYS = [
  'paywall.benefit1',
  'paywall.benefit2',
  'paywall.benefit3',
] as const satisfies readonly TranslationKey[];

/** Maps an SDK outcome to the message key shown under the CTA. */
function outcomeMessageKey(outcome: UnlockOutcome, restoring: boolean): TranslationKey | null {
  switch (outcome.status) {
    case 'unlocked':
      return restoring ? 'paywall.restoreSuccess' : 'paywall.purchaseSuccess';
    case 'cancelled':
      return 'paywall.purchaseCancelled';
    case 'not-configured':
      return 'paywall.notConfiguredBody';
    case 'native-unavailable':
      return 'paywall.nativeUnavailableBody';
    case 'no-offering':
      return 'paywall.offeringUnavailable';
    case 'nothing-to-restore':
      return 'paywall.restoreNone';
    case 'error':
      return restoring ? 'paywall.restoreError' : 'paywall.purchaseError';
  }
}

export function Paywall({ onUnlocked, onDismiss }: PaywallProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const {
    unlocked,
    checking,
    purchasing,
    restoring,
    purchasesConfigured,
    purchasesNativeAvailable,
    price,
    offeringUnavailable,
    purchase,
    restore,
  } = useUnlock();

  const [messageKey, setMessageKey] = useState<TranslationKey | null>(null);

  async function run(action: () => Promise<UnlockOutcome>, isRestore: boolean) {
    setMessageKey(null);
    const outcome = await action();
    setMessageKey(outcomeMessageKey(outcome, isRestore));
    if (outcome.status === 'unlocked') {
      onUnlocked?.();
    }
  }

  if (unlocked) {
    return (
      <Screen scroll>
        <Badge label={t('status.unlocked')} tone="success" />
        <Text variant="title">{t('paywall.alreadyUnlockedTitle')}</Text>
        <Text color="textMuted">{t('paywall.alreadyUnlockedBody')}</Text>
        {onDismiss ? <Button label={t('common.close')} onPress={onDismiss} /> : null}
      </Screen>
    );
  }

  const ctaLabel = price ? t('paywall.purchaseCtaWithPrice', { price }) : t('paywall.purchaseCta');

  const ctaDisabled = !purchasesConfigured || offeringUnavailable || checking;

  return (
    <Screen scroll>
      <View style={{ gap: theme.spacing.sm }}>
        <Ionicons name="lock-open-outline" size={36} color={theme.colors.primary} />
        <Text variant="display">{t('paywall.title')}</Text>
        <Text color="textMuted">{t('paywall.subtitle')}</Text>
      </View>

      <Card>
        {BENEFIT_KEYS.map((key) => (
          <View
            key={key}
            style={{ flexDirection: 'row', gap: theme.spacing.md, alignItems: 'flex-start' }}
          >
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={theme.colors.success}
              style={{ marginTop: 1 }}
            />
            <Text style={{ flex: 1 }}>{t(key)}</Text>
          </View>
        ))}
      </Card>

      {!purchasesConfigured ? (
        <Card>
          <Text variant="bodyStrong" color="warning">
            {t(
              purchasesNativeAvailable
                ? 'paywall.notConfiguredTitle'
                : 'paywall.nativeUnavailableTitle',
            )}
          </Text>
          <Text variant="caption" color="textMuted">
            {t(
              purchasesNativeAvailable
                ? 'paywall.notConfiguredBody'
                : 'paywall.nativeUnavailableBody',
            )}
          </Text>
        </Card>
      ) : null}

      {offeringUnavailable ? (
        <Text variant="caption" color="warning">
          {t('paywall.offeringUnavailable')}
        </Text>
      ) : null}

      <View style={{ gap: theme.spacing.sm }}>
        <Button
          label={purchasing ? t('paywall.purchasing') : ctaLabel}
          onPress={() => void run(purchase, false)}
          loading={purchasing}
          disabled={ctaDisabled || restoring}
          testID="paywall-purchase"
        />
        <Button
          label={restoring ? t('paywall.restoring') : t('paywall.restore')}
          variant="ghost"
          onPress={() => void run(restore, true)}
          loading={restoring}
          disabled={!purchasesConfigured || purchasing}
          testID="paywall-restore"
        />
        {checking && purchasesConfigured ? (
          <View style={{ flexDirection: 'row', gap: theme.spacing.sm, alignItems: 'center' }}>
            <ActivityIndicator size="small" color={theme.colors.textMuted} />
            <Text variant="caption" color="textMuted">
              {t('status.checking')}
            </Text>
          </View>
        ) : null}
      </View>

      {messageKey ? (
        <Text variant="caption" color="textMuted" center>
          {t(messageKey)}
        </Text>
      ) : null}

      <Text variant="caption" color="textMuted" center>
        {t('paywall.oneTimeNote')}
      </Text>

      {onDismiss ? <Button label={t('common.close')} variant="ghost" onPress={onDismiss} /> : null}
    </Screen>
  );
}
