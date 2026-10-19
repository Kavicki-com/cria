import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import {
  Button,
  IconButton,
  IconChevronLeft,
  IconInfo,
  IconPencil,
  Screen,
  Text,
} from '@/core/components';
import { useTranslation } from '@/core/i18n/useTranslation';
import { dismissToOnce, pushOnce, replaceOnce } from '@/core/navigation';
import { useTheme } from '@/core/theme';
import { PARTES_SWOT, type SwotItem } from '@/data';

import { chaveParte, COR_PARTE } from './partes';

/** Review of the SWOT (design Revisao-swot): one card per part, tap to edit it. */
export function RevisaoSwotScreen({ negocioId, swot }: { negocioId: string; swot: SwotItem[] }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const hub = { pathname: '/negocio/[id]', params: { id: negocioId } } as const;

  return (
    <Screen
      scroll
      gap={10}
      header={
        <IconButton
          icon={IconChevronLeft}
          accessibilityLabel={t('common.back')}
          onPress={() => (router.canGoBack() ? router.back() : replaceOnce(hub))}
        />
      }
      footer={<Button label={t('revisao.tudoCerto')} onPress={() => dismissToOnce(hub)} />}
    >
      <View style={{ gap: 6, marginBottom: 6 }}>
        <Text variant="label" color="primaryText">
          {t('revisao.rotulo', { quadro: t('partes.swotTecnico') })}
        </Text>
        <Text variant="question" accessibilityRole="header">
          {t('partes.swot')}
        </Text>
        <Text variant="support" color="textMuted">
          {t('swot.revisaoToque')}
        </Text>
      </View>

      {PARTES_SWOT.map((parte, i) => {
        const itens = swot.filter((item) => item.parte === parte).map((item) => item.texto);
        const cor = COR_PARTE[parte];
        return (
          <Pressable
            key={parte}
            accessibilityRole="button"
            accessibilityLabel={`${t(chaveParte(parte, 'curto'))}. ${itens.join(', ') || t('swot.vazia')}`}
            onPress={() =>
              pushOnce({
                pathname: '/negocio/[id]/swot',
                params: { id: negocioId, parte: String(i + 1) },
              })
            }
            style={({ pressed }) => ({
              backgroundColor: pressed ? theme.colors.surfaceElevated : theme.colors.surface,
              borderWidth: 1,
              borderStyle: itens.length ? 'solid' : 'dashed',
              borderColor: itens.length ? theme.colors.border : theme.colors.textFaint,
              borderRadius: theme.radius.lg,
              paddingVertical: 14,
              paddingHorizontal: 16,
              gap: 8,
            })}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  borderRadius: theme.radius.pill,
                  paddingVertical: 4,
                  paddingHorizontal: 10,
                  backgroundColor: theme.colors[cor.fundo],
                }}
              >
                <Text variant="captionStrong" style={{ color: theme.colors[cor.texto] }}>
                  {t(chaveParte(parte, 'curto'))}
                </Text>
              </View>
              <IconPencil size={18} strokeWidth={2} color={theme.colors.primaryText} />
            </View>
            {itens.length ? (
              <Text variant="support">{itens.join(' · ')}</Text>
            ) : (
              <Text variant="support" color="textMuted" style={{ fontStyle: 'italic' }}>
                {t('swot.vazia')}
              </Text>
            )}
          </Pressable>
        );
      })}

      <View
        style={{
          backgroundColor: theme.colors.primarySoft,
          borderRadius: theme.radius.lg,
          paddingVertical: 14,
          paddingHorizontal: 16,
          flexDirection: 'row',
          gap: 12,
          alignItems: 'flex-start',
        }}
      >
        <IconInfo size={18} strokeWidth={2} color={theme.colors.primaryText} />
        <Text variant="caption" color="textBody" style={{ flex: 1, lineHeight: 20 }}>
          {t('swot.revisaoNota')}
        </Text>
      </View>
    </Screen>
  );
}
