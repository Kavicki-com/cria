import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import {
  Button,
  Dialog,
  IconButton,
  IconCheck,
  IconEye,
  IconTriangleAlert,
  IconX,
  Screen,
  Text,
} from '@/core/components';
import type { TranslationKey } from '@/core/i18n';
import { useTranslation } from '@/core/i18n/useTranslation';
import { pushOnce, replaceOnce } from '@/core/navigation';
import { useUnlock, type UnlockOutcome } from '@/core/purchases';
import { fonts, useTheme } from '@/core/theme';

import { SeloLiberado } from '../ui';

const BENEFICIOS: TranslationKey[] = [
  'desbloqueio.beneficioQuadros',
  'desbloqueio.beneficioAnalise',
  'desbloqueio.beneficioPdf',
  'desbloqueio.beneficioTodos',
];

type Folha = 'nenhuma' | 'ok' | 'erro' | 'pendente';

/**
 * Paywall for the one-time unlock (design Paywall, adapted: one product, no
 * "1 or 3" choice). The price is always the store's `priceString`.
 *
 * A failed purchase does not say "Nada foi cobrado": a connection can drop
 * after the store charged, so the sheet points to "Restaurar compra" instead,
 * as Churrapp does.
 */
export function PaywallScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const {
    price,
    purchasing,
    purchase,
    refresh,
    checking,
    purchasesConfigured,
    purchasesNativeAvailable,
    offeringUnavailable,
  } = useUnlock();
  const [folha, setFolha] = useState<Folha>('nenhuma');
  const [aviso, setAviso] = useState<TranslationKey | null>(null);
  const [verificando, setVerificando] = useState(false);

  function fechar() {
    if (router.canGoBack()) router.back();
    else replaceOnce('/');
  }

  async function comprar() {
    setAviso(null);
    const r: UnlockOutcome = await purchase();
    if (r.status === 'unlocked') setFolha('ok');
    else if (r.status === 'pending') setFolha('pendente');
    else if (r.status === 'cancelled') return;
    else if (r.status === 'not-configured' || r.status === 'native-unavailable') {
      setAviso('desbloqueio.lojaIndisponivel');
    } else if (r.status === 'no-offering') setAviso('desbloqueio.semOferta');
    else setFolha('erro');
  }

  async function verificar() {
    setVerificando(true);
    await refresh();
    setVerificando(false);
  }

  const lojaIndisponivel = !purchasesConfigured || offeringUnavailable;
  const avisoLoja: TranslationKey | null = !purchasesNativeAvailable
    ? 'desbloqueio.lojaSoNoApp'
    : !purchasesConfigured
      ? 'desbloqueio.lojaIndisponivel'
      : offeringUnavailable
        ? 'desbloqueio.semOferta'
        : null;

  return (
    <Screen
      scroll
      gap={18}
      header={
        <IconButton
          icon={IconX}
          size={22}
          accessibilityLabel={t('common.close')}
          onPress={fechar}
        />
      }
      footer={
        <View style={{ gap: 12 }}>
          <Button
            label={
              price ? t('desbloqueio.comprar', { preco: price }) : t('desbloqueio.comprarSemPreco')
            }
            loading={purchasing}
            disabled={lojaIndisponivel || !price || checking}
            onPress={() => void comprar()}
          />
          {checking && !price && !lojaIndisponivel ? (
            <Text variant="caption" color="textMuted" center style={{ fontSize: 13 }}>
              {t('desbloqueio.carregandoLoja')}
            </Text>
          ) : null}
          {avisoLoja || aviso ? (
            <Text variant="caption" color="danger" center style={{ fontSize: 13 }}>
              {t((aviso ?? avisoLoja)!)}
            </Text>
          ) : null}
          <Button
            variant="link"
            label={t('desbloqueio.restaurar')}
            onPress={() => pushOnce('/restaurar')}
            style={{ alignSelf: 'center' }}
          />
        </View>
      }
    >
      <View style={{ gap: 6 }}>
        <Text variant="question" accessibilityRole="header">
          {t('desbloqueio.titulo')}
        </Text>
        <Text variant="support" color="textMuted">
          {t('desbloqueio.subtitulo')}
        </Text>
      </View>

      <PreviaDocumento />

      <View
        style={{
          borderRadius: theme.radius.price,
          borderWidth: 2,
          borderColor: theme.colors.primary,
          backgroundColor: theme.colors.primarySoft,
          paddingVertical: 15,
          paddingHorizontal: 15,
          gap: 10,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
          }}
        >
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="support" style={{ fontFamily: theme.fonts.bold }}>
              {t('desbloqueio.produto')}
            </Text>
            <Text variant="caption" color="textBody" style={{ fontSize: 13 }}>
              {t('desbloqueio.produtoDetalhe')}
            </Text>
          </View>
          {price ? (
            <Text variant="heading" color="primaryText" style={{ fontSize: 26, lineHeight: 34 }}>
              {price}
            </Text>
          ) : checking && !lojaIndisponivel ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : null}
        </View>
        <View style={{ gap: 8 }}>
          {BENEFICIOS.map((chave) => (
            <View key={chave} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <IconCheck size={18} strokeWidth={2.4} color={theme.colors.primaryText} />
              <Text
                variant="caption"
                color="textBody"
                style={{ flex: 1, fontSize: 15, lineHeight: 21 }}
              >
                {t(chave)}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <Text variant="caption" color="textMuted" center style={{ fontSize: 13 }}>
        {t('desbloqueio.rodape')}
      </Text>

      <Dialog sheet visible={folha === 'ok'} onDismiss={fechar}>
        <SeloLiberado label={t('negocios.liberado')} />
        <Text variant="title" style={{ fontSize: 26, lineHeight: 33 }} accessibilityRole="header">
          {t('desbloqueio.okTitulo')}
        </Text>
        <Text variant="body" color="textBody" style={{ fontSize: 16, lineHeight: 24 }}>
          {t('desbloqueio.okTexto')}
        </Text>
        <Button label={t('common.continue')} onPress={fechar} />
      </Dialog>

      <Dialog sheet visible={folha === 'erro'} onDismiss={() => setFolha('nenhuma')}>
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 18,
            backgroundColor: theme.colors.dangerSoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconTriangleAlert size={26} strokeWidth={2} color={theme.colors.danger} />
        </View>
        <Text variant="title" style={{ fontSize: 26, lineHeight: 33 }} accessibilityRole="header">
          {t('desbloqueio.erroTitulo')}
        </Text>
        <Text variant="body" color="textBody" style={{ fontSize: 16, lineHeight: 24 }}>
          {t('desbloqueio.erroTexto')}
        </Text>
        <View style={{ gap: 10 }}>
          <Button
            label={t('desbloqueio.tentarDeNovo')}
            onPress={() => {
              setFolha('nenhuma');
              void comprar();
            }}
          />
          <Button
            variant="secondary"
            label={t('desbloqueio.agoraNao')}
            onPress={() => setFolha('nenhuma')}
          />
          <Button
            variant="link"
            label={t('desbloqueio.restaurar')}
            onPress={() => {
              setFolha('nenhuma');
              pushOnce('/restaurar');
            }}
            style={{ alignSelf: 'center' }}
          />
        </View>
      </Dialog>

      <Dialog sheet visible={folha === 'pendente'} onDismiss={fechar}>
        <Text variant="title" style={{ fontSize: 26, lineHeight: 33 }} accessibilityRole="header">
          {t('desbloqueio.pendenteTitulo')}
        </Text>
        <Text variant="body" color="textBody" style={{ fontSize: 16, lineHeight: 24 }}>
          {t('desbloqueio.pendenteTexto')}
        </Text>
        <View style={{ gap: 12 }}>
          <Etapa estado="feita" texto={t('desbloqueio.etapaEnviado', { preco: price ?? '' })} />
          <Etapa estado="atual" texto={t('desbloqueio.etapaAguardando')} />
          <Etapa estado="futura" texto={t('desbloqueio.etapaLiberado')} />
        </View>
        <View style={{ gap: 10 }}>
          <Button
            label={t('desbloqueio.verificar')}
            loading={verificando}
            onPress={() => void verificar()}
          />
          <Button
            variant="secondary"
            label={t('desbloqueio.continuarPreenchendo')}
            onPress={fechar}
          />
        </View>
      </Dialog>
    </Screen>
  );
}

function Etapa({ estado, texto }: { estado: 'feita' | 'atual' | 'futura'; texto: string }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      {estado === 'feita' ? (
        <View
          style={{
            width: 26,
            height: 26,
            borderRadius: 13,
            backgroundColor: theme.colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconCheck size={14} strokeWidth={3} color={theme.colors.onPrimary} />
        </View>
      ) : estado === 'atual' ? (
        <ActivityIndicator
          size="small"
          color={theme.colors.accent}
          style={{ width: 26, height: 26 }}
        />
      ) : (
        <View
          style={{
            width: 26,
            height: 26,
            borderRadius: 13,
            borderWidth: 2,
            borderColor: theme.colors.borderInput,
          }}
        />
      )}
      <Text
        variant="support"
        style={{
          flex: 1,
          fontFamily: estado === 'atual' ? theme.fonts.bold : theme.fonts.regular,
          color: estado === 'futura' ? theme.colors.textMuted : theme.colors.text,
        }}
      >
        {texto}
      </Text>
    </View>
  );
}

/** The cover and a blurred SWOT page, as on the design's paywall. Paper is light in both themes. */
function PreviaDocumento() {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={t('desbloqueio.previaRotulo')}
      style={{
        height: 210,
        borderRadius: theme.radius.card,
        backgroundColor: theme.colors.neutralFill,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          width: 118,
          height: 166,
          backgroundColor: '#FFFDF9',
          borderRadius: 4,
          overflow: 'hidden',
          transform: [{ rotate: '-3deg' }],
          shadowColor: '#18212E',
          shadowOpacity: 0.16,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 10 },
          elevation: 5,
        }}
      >
        <View style={{ paddingTop: 12, paddingHorizontal: 10, gap: 3 }}>
          <Text
            allowFontScaling={false}
            style={{ fontSize: 5, fontFamily: fonts.bold, letterSpacing: 0.5, color: '#1F4F8F' }}
          >
            {t('boasVindas.docRotulo').toUpperCase()}
          </Text>
          <Text
            allowFontScaling={false}
            style={{ fontFamily: fonts.display, fontSize: 16, lineHeight: 17, color: '#18212E' }}
          >
            {t('boasVindas.docNome')}
          </Text>
          <Text allowFontScaling={false} style={{ fontSize: 5, color: '#545F6E' }}>
            {t('boasVindas.docSub')}
          </Text>
        </View>
        <View
          style={{ marginTop: 'auto', height: 64, backgroundColor: '#1F4F8F', overflow: 'hidden' }}
        >
          <View
            style={{
              position: 'absolute',
              width: 62,
              height: 62,
              borderRadius: 31,
              backgroundColor: '#EF6F7A',
              right: -16,
              top: -20,
            }}
          />
        </View>
      </View>
      <View
        style={{
          width: 118,
          height: 166,
          backgroundColor: '#FFFDF9',
          borderRadius: 4,
          padding: 10,
          gap: 5,
          transform: [{ rotate: '3deg' }],
          shadowColor: '#18212E',
          shadowOpacity: 0.16,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 10 },
          elevation: 5,
        }}
      >
        <Text
          allowFontScaling={false}
          style={{ fontSize: 5, fontFamily: fonts.bold, letterSpacing: 0.5, color: '#1F4F8F' }}
        >
          {t('boasVindas.docSwot').toUpperCase()}
        </Text>
        <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 3, opacity: 0.6 }}>
          {['#E4ECF7', '#FCE3E5', '#EDF0F4', '#ECE7F5'].map((cor) => (
            <View
              key={cor}
              style={{ width: '46%', flexGrow: 1, backgroundColor: cor, borderRadius: 2 }}
            />
          ))}
        </View>
      </View>
      <View
        style={{
          position: 'absolute',
          bottom: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.pill,
          paddingVertical: 6,
          paddingHorizontal: 12,
        }}
      >
        <IconEye size={14} strokeWidth={2} color={theme.colors.text} />
        <Text variant="caption" style={{ fontSize: 13, fontFamily: theme.fonts.bold }}>
          {t('desbloqueio.previa')}
        </Text>
      </View>
    </View>
  );
}
