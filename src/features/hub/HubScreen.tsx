import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import {
  Button,
  IconArrowRight,
  IconButton,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconFileText,
  IconLock,
  IconPencil,
  Screen,
  Text,
} from '@/core/components';
import type { TranslationKey } from '@/core/i18n';
import { useTranslation } from '@/core/i18n/useTranslation';
import { pushOnce, replaceOnce } from '@/core/navigation';
import { openPaywall, useUnlock } from '@/core/purchases';
import { useTheme } from '@/core/theme';
import type { Quadro, RespostasPorQuadro } from '@/data';

import { formatarInteiro } from '../dinheiro';
import { avaliarNumeros, calcularIndicadores } from '../equilibrio/calculo';
import { useUnidade } from '../equilibrio/useUnidade';
import {
  parteCompleta,
  proximaParte,
  ROTULO_ESTAGIO,
  ROTULO_PARTE,
  ROTULO_SEGMENTO,
  type DadosNegocio,
  type Parte,
} from '../negocios';
import { QUADROS } from '../quadros';
import { AnelProgresso } from '../ui';
import { CardAnalise } from './CardAnalise';

/**
 * The business hub: one route, free or unlocked (design Hub-gratis, Hub,
 * Estado-negocio-0). The header stays separate from the analysis card — the
 * design untangled them on purpose.
 */
export function HubScreen({ dados }: { dados: DadosNegocio }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { unlocked } = useUnlock();
  const { negocio, progresso } = dados;
  const id = negocio.id;

  const proxima = proximaParte(progresso);
  const comecar = progresso.vazio;
  const partes: Parte[] = unlocked
    ? ['lean', 'bmc', 'swot', 'persona', 'equilibrio', 'plano']
    : ['lean', 'equilibrio'];

  function gerarDocumento() {
    if (unlocked) pushOnce({ pathname: '/negocio/[id]/documento', params: { id } });
    else openPaywall('hub-documento');
  }

  return (
    <Screen
      scroll
      gap={14}
      header={
        <>
          <IconButton
            icon={IconChevronLeft}
            accessibilityLabel={t('hub.voltar')}
            onPress={() => (router.canGoBack() ? router.back() : replaceOnce('/'))}
          />
          <View style={{ flex: 1 }} />
          <IconButton
            icon={IconPencil}
            size={20}
            accessibilityLabel={t('hub.editar')}
            onPress={() => pushOnce({ pathname: '/negocio/[id]/editar', params: { id } })}
          />
        </>
      }
      footer={
        <View style={{ gap: 10 }}>
          <Text variant="caption" color="textMuted">
            {unlocked
              ? t('hub.rodapeLiberado')
              : comecar
                ? t('hub.rodapeComecar')
                : t('hub.rodapeGratis')}
          </Text>
          <Button
            label={t('hub.gerarDocumento')}
            icon={unlocked ? IconFileText : IconLock}
            onPress={gerarDocumento}
            disabled={comecar}
          />
        </View>
      }
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text variant="title" accessibilityRole="header">
            {negocio.nome}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Text variant="support" color="textMuted">
              {t('negocios.linha', {
                segmento: t(ROTULO_SEGMENTO[negocio.segmento]),
                estagio: t(ROTULO_ESTAGIO[negocio.estagio]),
              })}
            </Text>
            {unlocked ? null : (
              <View
                style={{
                  backgroundColor: theme.colors.surfaceElevated,
                  borderRadius: theme.radius.pill,
                  paddingVertical: 3,
                  paddingHorizontal: 10,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: theme.fonts.bold,
                    color: theme.colors.textBody,
                  }}
                >
                  {t('hub.gratuito')}
                </Text>
              </View>
            )}
          </View>
        </View>
        <AnelProgresso
          fracao={progresso.percentual / 100}
          size={64}
          espessura={7}
          centro={theme.colors.background}
          rotulo={t('negocios.percentual', { n: progresso.percentual })}
          accessibilityLabel={t('hub.concluido', { n: progresso.percentual })}
        />
      </View>

      {comecar ? (
        <CardComecar onPress={() => pushOnce({ pathname: '/negocio/[id]/lean', params: { id } })} />
      ) : unlocked ? (
        <CardAnalise dados={dados} />
      ) : null}

      <View style={{ gap: 8 }}>
        {partes
          .filter((parte) => !(comecar && parte === 'lean'))
          .map((parte) => (
            <LinhaParte
              key={parte}
              dados={dados}
              parte={parte}
              atual={unlocked && !comecar && parte === proxima}
            />
          ))}
      </View>

      {!unlocked && !comecar ? <CardAnalise dados={dados} /> : null}

      {unlocked ? null : (
        <View style={{ gap: 8 }}>
          <Text variant="label" color="textMuted" accessibilityRole="header">
            {t('hub.noCompleto')}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {(['bmc', 'swot', 'persona', 'plano'] as const).map((parte) => (
              <Pressable
                key={parte}
                accessibilityRole="button"
                accessibilityLabel={t('hub.bloqueado', { parte: t(ROTULO_PARTE[parte]) })}
                onPress={() => openPaywall(`hub-${parte}`)}
                style={({ pressed }) => ({
                  width: '48%',
                  flexGrow: 1,
                  minHeight: 60,
                  backgroundColor: pressed
                    ? theme.colors.surfaceElevated
                    : theme.colors.neutralFill,
                  borderRadius: theme.radius.input,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                })}
              >
                <IconLock size={18} strokeWidth={2} color={theme.colors.textMuted} />
                <Text
                  variant="caption"
                  style={{ flex: 1, fontFamily: theme.fonts.bold, lineHeight: 18 }}
                >
                  {t(ROTULO_PARTE[parte])}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text variant="caption" color="textMuted" style={{ fontSize: 13 }}>
            {t('hub.noCompletoTexto')}
          </Text>
        </View>
      )}
    </Screen>
  );
}

/** Estado-negocio-0: "Por onde começar → Sua ideia em uma página". */
function CardComecar({ onPress }: { onPress: () => void }) {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: theme.colors.primarySoft,
        borderWidth: 1,
        borderColor: theme.colors.primarySoftBorder,
        borderRadius: theme.radius.card,
        padding: 18,
        gap: 12,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <Text variant="label" style={{ color: theme.colors.accent }}>
        {t('hub.porOndeComecar')}
      </Text>
      <Text variant="heading" style={{ fontSize: 21, lineHeight: 28 }}>
        {t('partes.lean')}
      </Text>
      <Text variant="support" color="textBody">
        {t('hub.comecarTexto')}
      </Text>
      <View
        style={{
          alignSelf: 'flex-start',
          minHeight: 44,
          paddingHorizontal: 18,
          borderRadius: 12,
          backgroundColor: theme.colors.primary,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Text
          variant="support"
          style={{ color: theme.colors.onPrimary, fontFamily: theme.fonts.bold }}
        >
          {t('hub.comecarAgora')}
        </Text>
        <IconArrowRight size={18} strokeWidth={2.2} color={theme.colors.onPrimary} />
      </View>
    </Pressable>
  );
}

const NOME_TECNICO_PARTE: Partial<Record<Parte, TranslationKey>> = {
  lean: 'partes.leanTecnico',
  bmc: 'partes.bmcTecnico',
  swot: 'partes.swotTecnico',
  persona: 'partes.personaTecnico',
};

/** First question still unanswered, 1-based, for `?pergunta=`. */
function primeiraPendente(respostas: RespostasPorQuadro, quadro: Quadro): number {
  const campos = QUADROS[quadro].campos;
  const i = campos.findIndex((c) => !respostas[quadro][c]?.texto.trim());
  return i === -1 ? 1 : i + 1;
}

function LinhaParte({
  dados,
  parte,
  atual,
}: {
  dados: DadosNegocio;
  parte: Parte;
  atual: boolean;
}) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { negocio, progresso, respostas, numeros } = dados;
  const unidade = useUnidade(numeros);
  const id = negocio.id;
  const completa = parteCompleta(progresso, parte);

  let subtitulo: string;
  let fracao: number;
  switch (parte) {
    case 'lean':
    case 'bmc':
    case 'persona':
    case 'swot': {
      const c = progresso[parte];
      subtitulo = `${t(NOME_TECNICO_PARTE[parte]!)} · ${t('hub.deTotal', { n: c.feitos, total: c.total })}`;
      fracao = c.feitos / c.total;
      break;
    }
    case 'equilibrio': {
      const estado = avaliarNumeros(numeros);
      subtitulo =
        estado.tipo === 'ok'
          ? t('equilibrio.resumo', {
              n: formatarInteiro(calcularIndicadores(estado.numeros).empateMes),
              plural: unidade.plural,
            })
          : estado.tipo === 'nao-fecha'
            ? t('equilibrio.resumoNaoFecha')
            : t('equilibrio.resumoVazio');
      fracao = completa ? 1 : 0;
      break;
    }
    case 'plano': {
      const p = progresso.plano;
      subtitulo =
        p.total === 0
          ? t('hub.nenhumaTarefa')
          : t('hub.tarefasFeitas', { n: p.feitos, total: p.total });
      fracao = p.total === 0 ? 0 : p.feitos / p.total;
      break;
    }
  }

  function abrir() {
    switch (parte) {
      case 'lean':
      case 'bmc':
        pushOnce(
          completa
            ? { pathname: `/negocio/[id]/${parte}-revisao`, params: { id } }
            : {
                pathname: `/negocio/[id]/${parte}`,
                params: { id, pergunta: String(primeiraPendente(respostas, parte)) },
              },
        );
        return;
      case 'persona':
        pushOnce(
          completa
            ? { pathname: '/negocio/[id]/persona-revisao', params: { id } }
            : {
                pathname: '/negocio/[id]/persona',
                params: { id, pergunta: String(primeiraPendente(respostas, 'persona')) },
              },
        );
        return;
      case 'swot':
        pushOnce({
          pathname: completa ? '/negocio/[id]/swot-revisao' : '/negocio/[id]/swot',
          params: { id },
        });
        return;
      case 'equilibrio':
        pushOnce({ pathname: '/negocio/[id]/equilibrio', params: { id } });
        return;
      case 'plano':
        pushOnce({ pathname: '/negocio/[id]/plano-acao', params: { id } });
        return;
    }
  }

  let indicador: ReactNode;
  if (completa && parte !== 'plano') {
    indicador = (
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: theme.colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <IconCheck size={18} strokeWidth={2.6} color={theme.colors.onPrimary} />
      </View>
    );
  } else if (fracao > 0) {
    indicador = <AnelProgresso fracao={fracao} size={36} espessura={5} />;
  } else {
    indicador = (
      <View
        style={{
          width: 32,
          height: 32,
          marginHorizontal: 2,
          borderRadius: 16,
          borderWidth: 2,
          borderColor: theme.colors.borderInput,
        }}
      />
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${t(ROTULO_PARTE[parte])}. ${subtitulo}`}
      onPress={abrir}
      style={({ pressed }) => ({
        minHeight: 68,
        backgroundColor: pressed ? theme.colors.surfaceElevated : theme.colors.surface,
        borderWidth: atual ? 2 : 1,
        borderColor: atual ? theme.colors.primary : theme.colors.border,
        borderRadius: theme.radius.lg,
        paddingVertical: atual ? 11 : 12,
        paddingHorizontal: atual ? 13 : 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
      })}
    >
      {indicador}
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="bodyStrong" style={{ fontSize: 16, lineHeight: 22 }}>
          {t(ROTULO_PARTE[parte])}
        </Text>
        <Text variant="caption" color="textMuted" style={{ fontSize: 13 }}>
          {subtitulo}
        </Text>
      </View>
      {atual ? (
        <Text variant="captionStrong" color="primaryText" style={{ fontSize: 14 }}>
          {t('hub.continuar')}
        </Text>
      ) : (
        <IconChevronRight size={18} strokeWidth={2} color={theme.colors.textFaint} />
      )}
    </Pressable>
  );
}
