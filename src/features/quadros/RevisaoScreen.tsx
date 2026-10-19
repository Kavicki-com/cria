import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Button, IconButton, IconChevronLeft, IconPencil, Screen, Text } from '@/core/components';
import { useTranslation } from '@/core/i18n/useTranslation';
import { dismissToOnce, pushOnce, replaceOnce } from '@/core/navigation';
import { useTheme } from '@/core/theme';
import type { Quadro, RespostasPorQuadro } from '@/data';

import { ROTULO_PARTE } from '../negocios/rotulos';
import { QUADROS } from './definicoes';
import { chaveCampo, NOME_TECNICO, PARTE_DO_QUADRO } from './textos';

export type RevisaoProps = {
  negocioId: string;
  quadro: Exclude<Quadro, 'persona'>;
  respostas: RespostasPorQuadro;
};

const ROTA_FORMULARIO = {
  lean: '/negocio/[id]/lean',
  bmc: '/negocio/[id]/bmc',
} as const;

/**
 * Review of a board (design Revisao): every answer, tap one to edit it in the
 * form at that question. Skipped and unanswered ones show "Responder".
 */
export function RevisaoScreen({ negocioId, quadro, respostas }: RevisaoProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const hub = { pathname: '/negocio/[id]', params: { id: negocioId } } as const;

  return (
    <Screen
      scroll
      gap={8}
      header={
        <IconButton
          icon={IconChevronLeft}
          accessibilityLabel={t('common.back')}
          onPress={() => (router.canGoBack() ? router.back() : replaceOnce(hub))}
        />
      }
      footer={<Button label={t('revisao.tudoCerto')} onPress={() => dismissToOnce(hub)} />}
    >
      <View style={{ gap: 6, marginBottom: 10 }}>
        <Text variant="label" color="primaryText">
          {t('revisao.rotulo', { quadro: t(NOME_TECNICO[quadro]) })}
        </Text>
        <Text variant="question" accessibilityRole="header">
          {t(ROTULO_PARTE[PARTE_DO_QUADRO[quadro]])}
        </Text>
        <Text variant="support" color="textMuted">
          {t('revisao.toque')}
        </Text>
      </View>

      {QUADROS[quadro].campos.map((campo, i) => {
        const resposta = respostas[quadro][campo];
        const texto = resposta?.texto.trim() ?? '';
        const rotulo = t('revisao.item', {
          n: i + 1,
          bloco: t(chaveCampo(quadro, campo, 'bloco')),
        });
        return (
          <Pressable
            key={campo}
            accessibilityRole="button"
            accessibilityLabel={`${rotulo}. ${texto || t(resposta?.pulada ? 'revisao.pulada' : 'revisao.semResposta')}`}
            accessibilityHint={texto ? t('revisao.editar') : t('revisao.responder')}
            onPress={() =>
              pushOnce({
                pathname: ROTA_FORMULARIO[quadro],
                params: { id: negocioId, pergunta: String(i + 1) },
              })
            }
            style={({ pressed }) => ({
              backgroundColor: pressed ? theme.colors.surfaceElevated : theme.colors.surface,
              borderWidth: 1,
              borderStyle: texto ? 'solid' : 'dashed',
              borderColor: texto ? theme.colors.border : theme.colors.textFaint,
              borderRadius: theme.radius.input,
              paddingVertical: 14,
              paddingHorizontal: 16,
              flexDirection: 'row',
              gap: 12,
              alignItems: texto ? 'flex-start' : 'center',
            })}
          >
            <View style={{ flex: 1, gap: 4 }}>
              <Text variant="captionStrong" color="textMuted">
                {rotulo}
              </Text>
              {texto ? (
                <Text variant="support">{texto}</Text>
              ) : (
                <Text variant="support" color="textMuted" style={{ fontStyle: 'italic' }}>
                  {t(resposta?.pulada ? 'revisao.pulada' : 'revisao.semResposta')}
                </Text>
              )}
            </View>
            {texto ? (
              <IconPencil size={18} strokeWidth={2} color={theme.colors.primaryText} />
            ) : (
              <Text variant="captionStrong" color="primaryText" style={{ fontSize: 14 }}>
                {t('revisao.responder')}
              </Text>
            )}
          </Pressable>
        );
      })}
    </Screen>
  );
}
