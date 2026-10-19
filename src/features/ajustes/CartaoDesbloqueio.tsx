import { View } from 'react-native';

import { Text } from '@/core/components';
import { useTranslation } from '@/core/i18n/useTranslation';
import { useUnlock } from '@/core/purchases';
import { useTheme } from '@/core/theme';

/** The blue card at the top of Ajustes: whether the full plan is unlocked. */
export function CartaoDesbloqueio() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { unlocked } = useUnlock();

  return (
    <View
      style={{
        backgroundColor: theme.colors.primary,
        borderRadius: theme.radius.card,
        padding: 18,
        gap: 8,
      }}
    >
      <Text variant="heading" style={{ color: theme.colors.onPrimary }}>
        {unlocked ? t('ajustes.liberadoTitulo') : t('ajustes.completoTitulo')}
      </Text>
      <Text variant="support" style={{ color: theme.colors.onPrimary, opacity: 0.85 }}>
        {unlocked ? t('ajustes.liberadoTexto') : t('ajustes.bloqueadoTexto')}
      </Text>
    </View>
  );
}
