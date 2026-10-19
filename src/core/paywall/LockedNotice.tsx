import Ionicons from '@expo/vector-icons/Ionicons';
import { View } from 'react-native';

import { Badge, Button, Screen, Text } from '../components';
import { useTranslation } from '../i18n/useTranslation';
import { openPaywall } from '../purchases';
import { useTheme } from '../theme';

export type LockedNoticeProps = {
  /** Identifies which feature sent the user here. */
  source?: string;
};

/**
 * Full-screen "this is locked" state. Drop it in wherever a screen needs the
 * unlock, instead of re-implementing the empty state per feature.
 */
export function LockedNotice({ source }: LockedNoticeProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Screen style={{ justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ alignItems: 'center', gap: theme.spacing.md, maxWidth: 420 }}>
        <Ionicons name="lock-closed" size={40} color={theme.colors.textMuted} />
        <Badge label={t('locked.badge')} tone="textMuted" />
        <Text variant="title" center>
          {t('locked.title')}
        </Text>
        <Text color="textMuted" center>
          {t('locked.body')}
        </Text>
        <Button label={t('locked.unlockCta')} onPress={() => openPaywall(source)} />
      </View>
    </Screen>
  );
}
