import { Pressable, View } from 'react-native';

import { IconChevronRight, IconFileCheck, IconLock, Text } from '@/core/components';
import { useTranslation } from '@/core/i18n/useTranslation';
import { pushOnce } from '@/core/navigation';
import { openPaywall, useUnlock } from '@/core/purchases';
import { useTheme } from '@/core/theme';

import { contarAtencao, contarPassos, textoAchado } from '../analise/textos';
import { useAnalise } from '../analise/useAnalise';
import type { DadosNegocio } from '../negocios';
import { INSIGHTS_PREVIA } from '../plano';

/**
 * The analysis card on the hub (design Hub / Hub-gratis): with the unlock, a
 * link to "Sua análise"; on the free tier, the preview — the whole analysis
 * is computed, but only the first point of attention is shown in full and
 * the rest are skeleton bars with no real text (no BlurView: a blur on
 * Android is not reliable, and blurred text could still be read).
 */
export function CardAnalise({ dados }: { dados: DadosNegocio }) {
  const theme = useTheme();
  const { t, locale } = useTranslation();
  const { unlocked } = useUnlock();
  const analise = useAnalise(dados);
  const resumo = {
    atencao: contarAtencao(t, analise.atencao.length),
    passos: contarPassos(t, analise.passos.length),
  };

  if (unlocked) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={() =>
          pushOnce({ pathname: '/negocio/[id]/analise', params: { id: dados.negocio.id } })
        }
        style={({ pressed }) => ({
          backgroundColor: theme.colors.primarySoft,
          borderWidth: 1,
          borderColor: theme.colors.primarySoftBorder,
          borderRadius: 18,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <View style={{ flex: 1, gap: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <IconFileCheck size={14} strokeWidth={2.4} color={theme.colors.success} />
            <Text variant="label" style={{ fontSize: 12, color: theme.colors.success }}>
              {t('negocios.liberado')}
            </Text>
          </View>
          <Text variant="subheading">{t('analise.verAnalise')}</Text>
          <Text variant="caption" color="textBody" style={{ fontSize: 13 }}>
            {t('analise.cardResumo', resumo)}
          </Text>
        </View>
        <IconChevronRight size={20} strokeWidth={2} color={theme.colors.primaryText} />
      </Pressable>
    );
  }

  const visiveis = analise.atencao.slice(0, INSIGHTS_PREVIA);
  const ocultos = Math.max(0, analise.atencao.length - INSIGHTS_PREVIA) + analise.passos.length;

  return (
    <View
      style={{
        backgroundColor: theme.colors.primarySoft,
        borderWidth: 1,
        borderColor: theme.colors.primarySoftBorder,
        borderRadius: theme.radius.card,
        padding: 16,
        gap: 12,
      }}
    >
      <View style={{ gap: 4 }}>
        <Text variant="label" color="primaryText" style={{ fontSize: 12 }}>
          {t('analise.previa')}
        </Text>
        <Text variant="subheading" style={{ lineHeight: 23 }}>
          {analise.atencao.length > 0
            ? t('analise.previaResumo', resumo)
            : t('analise.previaVazia')}
        </Text>
      </View>

      {visiveis.map((a) => {
        const { titulo, texto } = textoAchado(t, locale, a);
        return (
          <View
            key={a.regra}
            style={{ backgroundColor: theme.colors.surface, borderRadius: 12, padding: 12, gap: 4 }}
          >
            <Text
              variant="caption"
              style={{ fontFamily: theme.fonts.bold, color: theme.colors.text }}
            >
              {titulo}
            </Text>
            <Text variant="caption" color="textBody" style={{ fontSize: 13, lineHeight: 19 }}>
              {texto}
            </Text>
          </View>
        );
      })}

      {ocultos > 0 ? (
        <View
          accessible
          accessibilityLabel={t('analise.borrado')}
          style={{ gap: 8, paddingHorizontal: 2 }}
        >
          {Array.from({ length: Math.min(ocultos, 3) }, (_, i) => (
            <View key={i} style={{ gap: 5 }}>
              <View
                style={{
                  height: 9,
                  width: `${[88, 72, 80][i] ?? 80}%`,
                  borderRadius: 5,
                  backgroundColor: theme.colors.primarySoftBorder,
                }}
              />
              <View
                style={{
                  height: 9,
                  width: `${[54, 64, 40][i] ?? 50}%`,
                  borderRadius: 5,
                  backgroundColor: theme.colors.primarySoftBorder,
                  opacity: 0.7,
                }}
              />
            </View>
          ))}
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        onPress={() => openPaywall('hub-analise')}
        style={({ pressed }) => ({
          minHeight: 48,
          borderRadius: theme.radius.input,
          backgroundColor: pressed ? theme.colors.primaryPressed : theme.colors.primary,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        })}
      >
        <IconLock size={18} strokeWidth={2} color={theme.colors.onPrimary} />
        <Text style={{ fontSize: 16, fontFamily: theme.fonts.bold, color: theme.colors.onPrimary }}>
          {t('analise.verCompleta')}
        </Text>
      </Pressable>
    </View>
  );
}
