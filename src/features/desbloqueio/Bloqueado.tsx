import { router } from 'expo-router';
import { View } from 'react-native';

import { Button, IconButton, IconChevronLeft, IconLock, Screen, Text } from '@/core/components';
import type { TranslationKey } from '@/core/i18n';
import { useTranslation } from '@/core/i18n/useTranslation';
import { replaceOnce } from '@/core/navigation';
import { openPaywall } from '@/core/purchases';
import { useTheme } from '@/core/theme';

/**
 * What a paid screen shows when it is opened without the unlock — by a deep
 * link, a reminder tap, or a refund while the app is open. The hub already
 * sends taps on locked parts to the paywall; this is the screen re-checking.
 */
export function Bloqueado({ parte }: { parte: TranslationKey }) {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <Screen
      header={
        <IconButton
          icon={IconChevronLeft}
          accessibilityLabel={t('common.back')}
          onPress={() => (router.canGoBack() ? router.back() : replaceOnce('/'))}
        />
      }
      footer={
        <Button label={t('desbloqueio.verDesbloqueio')} onPress={() => openPaywall('rota-paga')} />
      }
      contentStyle={{ alignItems: 'center', justifyContent: 'center', gap: 14 }}
    >
      <View
        style={{
          width: 96,
          height: 96,
          borderRadius: 48,
          backgroundColor: theme.colors.primarySoft,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <IconLock size={40} strokeWidth={2} color={theme.colors.primaryText} />
      </View>
      <Text variant="heading" center accessibilityRole="header">
        {t(parte)}
      </Text>
      <Text variant="support" color="textMuted" center style={{ maxWidth: 300 }}>
        {t('desbloqueio.bloqueadoTexto')}
      </Text>
    </Screen>
  );
}
