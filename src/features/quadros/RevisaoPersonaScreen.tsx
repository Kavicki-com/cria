import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Button, IconButton, IconChevronLeft, IconPencil, Screen, Text } from '@/core/components';
import { useTranslation } from '@/core/i18n/useTranslation';
import { dismissToOnce, pushOnce, replaceOnce } from '@/core/navigation';
import { useTheme } from '@/core/theme';
import type { RespostasPorQuadro } from '@/data';

import { IlustracaoPersona } from '../ui';
import { CAMPO_ILUSTRACAO, ILUSTRACAO_PADRAO, QUADROS, type Ilustracao } from './definicoes';
import { chaveCampo } from './textos';

/** Fields shown as rows under the card; "quem", "rotina" and "proposta" live in the card. */
const LINHAS = ['quer', 'incomoda', 'decide'] as const;

/**
 * Review of the persona (design Revisao-persona): the blue card with the
 * illustration, name, routine and the value proposition, then the rest.
 */
export function RevisaoPersonaScreen({
  negocioId,
  respostas,
}: {
  negocioId: string;
  respostas: RespostasPorQuadro;
}) {
  const theme = useTheme();
  const { t } = useTranslation();
  const hub = { pathname: '/negocio/[id]', params: { id: negocioId } } as const;
  const p = respostas.persona;
  const ilustracao = (p[CAMPO_ILUSTRACAO]?.texto as Ilustracao | undefined) ?? ILUSTRACAO_PADRAO;
  const nome = p.quem?.texto.trim() || t('formulario.personaPadrao');
  const rotina = p.rotina?.texto.trim();
  const proposta = p.proposta?.texto.trim();

  function editar(campo: string) {
    const i = QUADROS.persona.campos.indexOf(campo);
    pushOnce({
      pathname: '/negocio/[id]/persona',
      params: { id: negocioId, pergunta: String(i + 1) },
    });
  }

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
          {t('revisao.rotulo', { quadro: t('persona.tecnico') })}
        </Text>
        <Text variant="question" accessibilityRole="header">
          {t('partes.persona')}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityHint={t('revisao.editar')}
        onPress={() => editar('quem')}
        style={({ pressed }) => ({
          backgroundColor: theme.colors.primary,
          borderRadius: theme.radius.card,
          padding: 18,
          gap: 14,
          opacity: pressed ? 0.9 : 1,
        })}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <IlustracaoPersona
            tipo={ilustracao}
            size={56}
            accessibilityLabel={t('formulario.ilustracaoRotulo', {
              genero: t(
                ilustracao === 'homem' ? 'formulario.homem' : 'formulario.mulher',
              ).toLowerCase(),
              nome,
            })}
          />
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="heading" style={{ color: theme.colors.onPrimary }}>
              {nome}
            </Text>
            {rotina ? (
              <Text variant="caption" style={{ color: theme.colors.onPrimary, opacity: 0.85 }}>
                {rotina}
              </Text>
            ) : null}
          </View>
        </View>
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: theme.scheme === 'dark' ? 'rgba(13,26,46,0.25)' : '#4A73B0',
            paddingTop: 12,
            gap: 4,
          }}
        >
          <Text
            variant="label"
            style={{
              fontSize: 12,
              color: theme.scheme === 'dark' ? theme.colors.onAccent : '#FFB3BA',
            }}
          >
            {t('persona.porQueEscolhe')}
          </Text>
          <Text variant="subheading" style={{ color: theme.colors.onPrimary, lineHeight: 23 }}>
            {proposta || t('revisao.semResposta')}
          </Text>
        </View>
      </Pressable>

      {LINHAS.map((campo) => {
        const texto = p[campo]?.texto.trim() ?? '';
        const rotulo = t(chaveCampo('persona', campo, 'bloco'));
        return (
          <Pressable
            key={campo}
            accessibilityRole="button"
            accessibilityLabel={`${rotulo}. ${texto || t('revisao.semResposta')}`}
            onPress={() => editar(campo)}
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
                  {t(p[campo]?.pulada ? 'revisao.pulada' : 'revisao.semResposta')}
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
