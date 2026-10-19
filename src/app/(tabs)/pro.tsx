import { Card, Screen, Text } from '@/core/components';
import { useTranslation } from '@/core/i18n/useTranslation';
import { LockedNotice } from '@/core/paywall';
import { useUnlock } from '@/core/purchases';

/**
 * Example of a gated screen.
 *
 * The tab press is already intercepted in `(tabs)/_layout.tsx`, but the screen
 * checks the entitlement too: a deep link can land here directly, and the
 * entitlement can change (refund, restore) while the app is open.
 */
export default function ProRoute() {
  const { t } = useTranslation();
  const { unlocked } = useUnlock();

  if (!unlocked) {
    return <LockedNotice source="pro-screen" />;
  }

  return (
    <Screen scroll edgeToEdgeBottom>
      <Text variant="title">{t('pro.title')}</Text>
      <Text color="textMuted">{t('pro.body')}</Text>

      <Card>
        <Text variant="heading">{t('pro.contentTitle')}</Text>
        <Text color="textMuted">{t('pro.contentBody')}</Text>
      </Card>
    </Screen>
  );
}
