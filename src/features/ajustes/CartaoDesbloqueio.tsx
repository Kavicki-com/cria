import { Pressable, View } from 'react-native';

import { IconChevronRight, Text } from '@/core/components';
import { useTranslation } from '@/core/i18n/useTranslation';
import { pushOnce } from '@/core/navigation';
import { openPaywall, useUnlock } from '@/core/purchases';
import { useTheme } from '@/core/theme';

/**
 * The blue card at the top of Ajustes (where the design had the credits):
 * whether the full plan is unlocked, the way to unlock it, and "Restaurar
 * compra" — which the App Store requires for a non-consumable.
 */
export function CartaoDesbloqueio() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { unlocked, price } = useUnlock();

  return (
    <View style={{ gap: 8 }}>
      <View
        style={{
          backgroundColor: theme.colors.primary,
          borderRadius: theme.radius.card,
          padding: 18,
          gap: 14,
        }}
      >
        <View style={{ gap: 6 }}>
          <Text variant="heading" style={{ color: theme.colors.onPrimary }}>
            {unlocked ? t('ajustes.liberadoTitulo') : t('ajustes.completoTitulo')}
          </Text>
          <Text variant="support" style={{ color: theme.colors.onPrimary, opacity: 0.85 }}>
            {unlocked ? t('ajustes.liberadoTexto') : t('ajustes.bloqueadoTexto')}
          </Text>
        </View>
        {unlocked ? null : (
          <Pressable
            accessibilityRole="button"
            onPress={() => openPaywall('ajustes')}
            style={({ pressed }) => ({
              alignSelf: 'flex-start',
              minHeight: 44,
              paddingHorizontal: 16,
              borderRadius: 12,
              backgroundColor: theme.colors.surface,
              justifyContent: 'center',
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Text
              variant="support"
              style={{ color: theme.colors.primaryText, fontFamily: theme.fonts.bold }}
            >
              {price ? t('ajustes.liberarPreco', { preco: price }) : t('ajustes.liberar')}
            </Text>
          </Pressable>
        )}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityHint={t('ajustes.restaurarDica')}
        onPress={() => pushOnce('/restaurar')}
        style={({ pressed }) => ({
          minHeight: 52,
          paddingHorizontal: 16,
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: pressed ? theme.colors.surfaceElevated : theme.colors.surface,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        })}
      >
        <View style={{ flex: 1, paddingVertical: 10, gap: 2 }}>
          <Text style={{ fontSize: 16 }}>{t('ajustes.restaurar')}</Text>
          <Text variant="caption" color="textMuted" style={{ fontSize: 13 }}>
            {t('ajustes.restaurarDica')}
          </Text>
        </View>
        <IconChevronRight size={18} strokeWidth={2} color={theme.colors.textFaint} />
      </Pressable>
    </View>
  );
}
