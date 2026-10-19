import { useRef, useState } from 'react';
import { View } from 'react-native';

import { Badge, Button, Card, Screen, Text } from '@/core/components';
import type { TranslationKey } from '@/core/i18n';
import { useTranslation } from '@/core/i18n/useTranslation';
import {
  cancelAllReminders,
  isNotificationsAvailable,
  scheduleInSeconds,
} from '@/core/notifications';
import { openPaywall, useUnlock } from '@/core/purchases';
import { shareToWhatsApp, sharePdf, shareViewAsImage, type ShareOutcome } from '@/core/share';
import { useTheme } from '@/core/theme';

/**
 * Demo home screen. Replace it with the app's real first screen — it exists to
 * show how the core modules are wired together.
 */

const REMINDER_DELAY_SECONDS = 10;

function shareMessageKey(
  outcome: ShareOutcome,
  kind: 'image' | 'pdf' | 'whatsapp',
): TranslationKey {
  if (outcome.status === 'shared' || outcome.status === 'cancelled') return 'common.done';
  if (outcome.status === 'unavailable') {
    if (outcome.reason === 'whatsapp') return 'share.whatsappUnavailable';
    if (outcome.reason === 'capture') return 'share.captureUnavailable';
    return 'share.sharingUnavailable';
  }
  return kind === 'pdf'
    ? 'share.pdfError'
    : kind === 'image'
      ? 'share.imageError'
      : 'common.genericError';
}

export default function HomeRoute() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { unlocked } = useUnlock();

  // In Expo Go on Android there is no notifications native module, so these
  // actions can only fail. Offering a dead button and explaining afterwards is
  // worse than showing up front that the feature needs a dev build.
  const remindersAvailable = isNotificationsAvailable();

  const captureRef = useRef<View>(null);
  const [messageKey, setMessageKey] = useState<TranslationKey | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function showKey(key: TranslationKey | null) {
    setMessage(null);
    setMessageKey(key);
  }

  /**
   * Shows the user-facing line, plus the underlying cause while developing.
   * The generic copy is right for production and useless for debugging, and
   * correlating a tap with a line in the Metro log is friction nobody needs.
   */
  function showShareOutcome(outcome: ShareOutcome, kind: 'image' | 'pdf' | 'whatsapp') {
    showKey(shareMessageKey(outcome, kind));

    if (!__DEV__) return;
    const detail =
      outcome.status === 'error'
        ? (outcome.detail ?? 'unknown error')
        : outcome.status === 'unavailable'
          ? `unavailable: ${outcome.reason}`
          : null;
    if (detail) setMessage(detail);
  }

  async function onScheduleReminder() {
    showKey(null);

    // Scheduling returns null for two very different reasons, and telling the
    // user to go fix a permission that was never asked for sends them chasing a
    // problem that is not there.
    if (!isNotificationsAvailable()) {
      showKey('notifications.unavailable');
      return;
    }

    const id = await scheduleInSeconds(
      { title: t('notifications.sampleTitle'), body: t('notifications.sampleBody') },
      REMINDER_DELAY_SECONDS,
    );

    if (id) {
      setMessageKey(null);
      setMessage(t('home.reminderScheduled', { seconds: REMINDER_DELAY_SECONDS }));
    } else {
      showKey('notifications.permissionBody');
    }
  }

  async function onCancelReminders() {
    await cancelAllReminders();
    showKey('home.remindersCancelled');
  }

  async function onShareWhatsApp() {
    const outcome = await shareToWhatsApp({ message: t('home.shareMessage') });
    showShareOutcome(outcome, 'whatsapp');
  }

  async function onShareImage() {
    const outcome = await shareViewAsImage(captureRef, { dialogTitle: t('share.dialogTitle') });
    showShareOutcome(outcome, 'image');
  }

  async function onSharePdf() {
    const outcome = await sharePdf({
      html: `<html><body style="font-family: -apple-system, sans-serif; padding: 24px">
        <h1>${t('common.appName')}</h1>
        <p>${t('home.shareMessage')}</p>
      </body></html>`,
      dialogTitle: t('share.dialogTitle'),
    });
    showShareOutcome(outcome, 'pdf');
  }

  return (
    <Screen scroll edgeToEdgeBottom>
      <View ref={captureRef} collapsable={false} style={{ gap: theme.spacing.sm }}>
        <Badge
          label={unlocked ? t('status.unlocked') : t('status.locked')}
          tone={unlocked ? 'success' : 'textMuted'}
        />
        <Text variant="display">{t('home.title')}</Text>
        <Text color="textMuted">{t('home.subtitle')}</Text>
      </View>

      {unlocked ? null : <Button label={t('home.unlockCta')} onPress={() => openPaywall('home')} />}

      <Card>
        <Text variant="heading">{t('home.modulesTitle')}</Text>
        <Text color="textMuted">{t('home.modulesBody')}</Text>
      </Card>

      <Card>
        <Text variant="heading">{t('home.featuresTitle')}</Text>
        <Text color="textMuted">{t('home.featuresBody')}</Text>
      </Card>

      <Card>
        <Text variant="heading">{t('home.notificationsTitle')}</Text>
        <Text color="textMuted">
          {remindersAvailable ? t('home.notificationsBody') : t('notifications.unavailable')}
        </Text>
        <Button
          label={t('home.scheduleReminder')}
          onPress={() => void onScheduleReminder()}
          disabled={!remindersAvailable}
        />
        <Button
          label={t('home.cancelReminders')}
          variant="secondary"
          onPress={() => void onCancelReminders()}
          disabled={!remindersAvailable}
        />
      </Card>

      <Card>
        <Text variant="heading">{t('home.shareTitle')}</Text>
        <Text color="textMuted">{t('home.shareBody')}</Text>
        <Button label={t('home.shareWhatsApp')} onPress={() => void onShareWhatsApp()} />
        <Button
          label={t('home.shareImage')}
          variant="secondary"
          onPress={() => void onShareImage()}
        />
        <Button label={t('home.sharePdf')} variant="secondary" onPress={() => void onSharePdf()} />
      </Card>

      {messageKey ? (
        <Text variant="caption" color="textMuted">
          {t(messageKey)}
        </Text>
      ) : null}
      {message ? (
        <Text variant="caption" color="textMuted">
          {message}
        </Text>
      ) : null}
    </Screen>
  );
}
