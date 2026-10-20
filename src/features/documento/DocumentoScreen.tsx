import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, View } from 'react-native';

import {
  Button,
  IconButton,
  IconCheck,
  IconEye,
  IconInfo,
  IconShare,
  IconSmartphone,
  IconX,
  Screen,
  Text,
  type Icon,
} from '@/core/components';
import type { TranslationKey } from '@/core/i18n';
import { useTranslation } from '@/core/i18n/useTranslation';
import { dismissToOnce, replaceOnce } from '@/core/navigation';
import { maybeRequestRating } from '@/core/rating';
import { fonts, useTheme } from '@/core/theme';

import { useAnalise } from '../analise/useAnalise';
import { useUnidade } from '../equilibrio/useUnidade';
import type { DadosNegocio } from '../negocios/useDados';
import { CAMPO_ILUSTRACAO, ILUSTRACAO_PADRAO, type Ilustracao } from '../quadros/definicoes';
import { salvarPdfEmPasta } from './arquivos';
import { fontesCss } from './fontes';
import { abrirPdf, compartilharPdf, gerarPdf } from './gerar';
import { slug } from './html';
import { montarDocumento, TOTAL_PAGINAS } from './montar';
import type { Traduzir } from './tipos';

const ETAPAS: TranslationKey[] = [
  'documento.etapa1',
  'documento.etapa2',
  'documento.etapa3',
  'documento.etapa4',
];

/** Each stage shows for at least this long, so the progress reads as progress. */
const MINIMO_ETAPA_MS = 450;

const esperar = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type Estado =
  | { tipo: 'gerando'; etapa: number }
  | { tipo: 'pronto'; uri: string; nome: string }
  | { tipo: 'erro' };

/**
 * Gerar documento (design Estado-gerando → Documento-pronto): builds the
 * nine-page PDF from the current answers, then offers to share, save or open
 * it. Generated again on every visit, so it always reflects the latest edits.
 */
export function DocumentoScreen({ dados }: { dados: DadosNegocio }) {
  const theme = useTheme();
  const { t, locale } = useTranslation();
  const analise = useAnalise(dados);
  const unidade = useUnidade(dados.numeros);
  const [estado, setEstado] = useState<Estado>({ tipo: 'gerando', etapa: 0 });
  const [tentativa, setTentativa] = useState(0);
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);
  const vivo = useRef(true);

  useEffect(() => {
    vivo.current = true;
    const traduzir: Traduzir = (chave, params) => t(chave as TranslationKey, params);
    const nome = `${t('documento.prefixoArquivo')}-${slug(dados.negocio.nome)}.pdf`;

    async function etapa<T>(n: number, trabalho: () => Promise<T> | T): Promise<T> {
      if (vivo.current) setEstado({ tipo: 'gerando', etapa: n });
      const [resultado] = await Promise.all([trabalho(), esperar(MINIMO_ETAPA_MS)]);
      return resultado;
    }

    void (async () => {
      const css = await etapa(0, fontesCss);
      const html = await etapa(1, () =>
        montarDocumento(
          {
            negocio: dados.negocio,
            respostas: dados.respostas,
            swot: dados.swot,
            numeros: dados.numeros,
            tarefas: dados.tarefas,
            analise,
            progresso: dados.progresso,
            unidade,
            ilustracao:
              (dados.respostas.persona[CAMPO_ILUSTRACAO]?.texto as Ilustracao | undefined) ??
              ILUSTRACAO_PADRAO,
            hoje: Date.now(),
            locale,
          },
          traduzir,
          css,
        ),
      );
      await etapa(2, () => undefined);
      const r = await etapa(3, () => gerarPdf(html, nome));
      if (!vivo.current) return;
      if (r.status === 'ok') {
        setEstado({ tipo: 'pronto', uri: r.uri, nome });
        // A finished document is the app's best "win" moment for a review.
        void maybeRequestRating();
      } else {
        setEstado({ tipo: 'erro' });
      }
    })();

    return () => {
      vivo.current = false;
    };
    // Generated once per visit (and on "Tentar de novo"): the data is read at that moment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tentativa]);

  const hub = { pathname: '/negocio/[id]', params: { id: dados.negocio.id } } as const;
  const fechar = () => (router.canGoBack() ? router.back() : replaceOnce(hub));

  if (estado.tipo === 'erro') {
    return (
      <Screen
        footer={
          <View style={{ gap: 10 }}>
            <Button
              label={t('desbloqueio.tentarDeNovo')}
              onPress={() => setTentativa((n) => n + 1)}
            />
            <Button
              variant="secondary"
              label={t('documento.voltar')}
              onPress={() => dismissToOnce(hub)}
            />
          </View>
        }
        contentStyle={{ justifyContent: 'center', alignItems: 'center', gap: 12 }}
      >
        <Text variant="title" center accessibilityRole="header">
          {t('documento.erroTitulo')}
        </Text>
        <Text variant="body" color="textMuted" center>
          {t('documento.erroTexto')}
        </Text>
      </Screen>
    );
  }

  if (estado.tipo === 'gerando') {
    const pct = Math.round((estado.etapa / ETAPAS.length) * 100);
    return (
      <Screen contentStyle={{ paddingTop: 100, gap: 32 }}>
        <PilhaDePaginas rotulo={t(ETAPAS[estado.etapa]!)} />
        <View style={{ gap: 10 }} accessibilityLiveRegion="polite">
          <Text variant="question" center accessibilityRole="header">
            {t('documento.gerandoTitulo')}
          </Text>
          <Text variant="body" color="textMuted" center style={{ fontSize: 16 }}>
            {t('documento.gerandoTexto')}
          </Text>
        </View>
        <View
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel={t('documento.progresso')}
          accessibilityValue={{ min: 0, max: 100, now: pct }}
          style={{
            height: 10,
            borderRadius: 5,
            backgroundColor: theme.colors.border,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              height: '100%',
              width: `${Math.max(pct, 6)}%`,
              borderRadius: 5,
              backgroundColor: theme.colors.primary,
            }}
          />
        </View>
        <View style={{ gap: 14 }}>
          {ETAPAS.map((chave, i) => (
            <View key={chave} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              {i < estado.etapa ? (
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
              ) : i === estado.etapa ? (
                <ActivityIndicator
                  size="small"
                  color={theme.colors.primary}
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
                style={{
                  fontSize: 16,
                  color: i > estado.etapa ? theme.colors.textMuted : theme.colors.text,
                }}
              >
                {t(chave)}
              </Text>
            </View>
          ))}
        </View>
      </Screen>
    );
  }

  const { uri, nome } = estado;

  async function compartilhar(titulo: string) {
    setAviso(null);
    const r = await compartilharPdf(uri, titulo);
    if (r.ok || !vivo.current) return;
    // The native reason only in development, to tell an Expo Go limit from a bug.
    const detalhe = __DEV__ && r.detalhe ? ` (${r.detalhe})` : '';
    setAviso({ tipo: 'erro', texto: t('documento.erroCompartilhar') + detalhe });
  }

  async function salvar() {
    setAviso(null);
    const r = await salvarPdfEmPasta(uri, nome);
    if (!vivo.current || r === 'cancelado') return;
    setAviso(
      r === 'ok'
        ? { tipo: 'ok', texto: t('documento.salvoAparelho', { nome }) }
        : { tipo: 'erro', texto: t('documento.erroSalvar') },
    );
  }

  return (
    <Screen
      scroll
      gap={22}
      header={
        <>
          <View style={{ flex: 1 }} />
          <IconButton
            icon={IconX}
            size={22}
            accessibilityLabel={t('common.close')}
            onPress={fechar}
          />
        </>
      }
      footer={<Button label={t('documento.voltar')} onPress={() => dismissToOnce(hub)} />}
    >
      <View style={{ alignItems: 'center', gap: 22 }}>
        <View>
          <CapaMiniatura
            nome={dados.negocio.nome}
            sub={t('documento.capaSub', {
              segmento: t(`segmentos.${dados.negocio.segmento}` as TranslationKey),
            })}
            rotulo={t('documento.planoDeNegocio')}
          />
          <View
            style={{
              position: 'absolute',
              right: -16,
              bottom: -14,
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: theme.colors.primary,
              borderWidth: 4,
              borderColor: theme.colors.background,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconCheck size={22} strokeWidth={2.6} color={theme.colors.onPrimary} />
          </View>
        </View>
        <View style={{ gap: 8 }}>
          <Text variant="title" center accessibilityRole="header">
            {t('documento.prontoTitulo')}
          </Text>
          <Text variant="support" color="textMuted" center>
            {t('documento.prontoArquivo', { nome: estado.nome, n: TOTAL_PAGINAS })}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Acao
          icone={IconShare}
          rotulo={t('documento.compartilhar')}
          onPress={() => void compartilhar(t('documento.compartilhar'))}
        />
        <Acao
          icone={IconSmartphone}
          rotulo={Platform.OS === 'android' ? t('documento.salvarAparelho') : t('documento.salvar')}
          onPress={() =>
            void (Platform.OS === 'android' ? salvar() : compartilhar(t('documento.salvar')))
          }
        />
        <Acao icone={IconEye} rotulo={t('documento.abrir')} onPress={() => void abrirPdf(uri)} />
      </View>

      {aviso ? (
        <Text
          variant="support"
          center
          accessibilityLiveRegion="polite"
          style={{ color: aviso.tipo === 'erro' ? theme.colors.danger : theme.colors.success }}
        >
          {aviso.texto}
        </Text>
      ) : null}

      <View
        style={{
          backgroundColor: theme.colors.primarySoft,
          borderRadius: theme.radius.lg,
          padding: 16,
          flexDirection: 'row',
          gap: 12,
          alignItems: 'flex-start',
        }}
      >
        <IconInfo size={20} strokeWidth={2} color={theme.colors.primaryText} />
        <View style={{ flex: 1, gap: 3 }}>
          <Text
            variant="support"
            style={{ fontFamily: theme.fonts.bold, color: theme.colors.primaryText }}
          >
            {t('documento.notaTitulo')}
          </Text>
          <Text variant="caption" color="textBody" style={{ lineHeight: 20 }}>
            {t('documento.notaTexto')}
          </Text>
        </View>
      </View>
    </Screen>
  );
}

function Acao({
  icone: Glyph,
  rotulo,
  onPress,
}: {
  icone: Icon;
  rotulo: string;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        minHeight: 84,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.borderInput,
        backgroundColor: pressed ? theme.colors.surfaceElevated : theme.colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingHorizontal: 6,
      })}
    >
      <Glyph size={22} strokeWidth={2} color={theme.colors.text} />
      <Text
        variant="caption"
        center
        style={{ fontFamily: theme.fonts.bold, color: theme.colors.text }}
      >
        {rotulo}
      </Text>
    </Pressable>
  );
}

/** The cover in miniature (Documento-pronto). Paper is light in both themes. */
function CapaMiniatura({ nome, sub, rotulo }: { nome: string; sub: string; rotulo: string }) {
  return (
    <View
      style={{
        width: 170,
        height: 240,
        backgroundColor: '#FFFDF9',
        borderWidth: 1,
        borderColor: '#E7E1D7',
        borderRadius: 6,
        overflow: 'hidden',
        shadowColor: '#18212E',
        shadowOpacity: 0.16,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 18 },
        elevation: 6,
      }}
    >
      <View style={{ paddingTop: 16, paddingHorizontal: 14, gap: 4 }}>
        <Text
          allowFontScaling={false}
          style={{ fontSize: 7, fontFamily: fonts.bold, letterSpacing: 0.7, color: '#1F4F8F' }}
        >
          {rotulo.toUpperCase()}
        </Text>
        <Text
          allowFontScaling={false}
          numberOfLines={3}
          style={{ fontFamily: fonts.display, fontSize: 20, lineHeight: 22, color: '#18212E' }}
        >
          {nome}
        </Text>
        <Text allowFontScaling={false} style={{ fontSize: 7, color: '#545F6E' }}>
          {sub}
        </Text>
      </View>
      <View
        style={{ marginTop: 'auto', height: 96, backgroundColor: '#1F4F8F', overflow: 'hidden' }}
      >
        <View
          style={{
            position: 'absolute',
            width: 90,
            height: 90,
            borderRadius: 45,
            backgroundColor: '#EF6F7A',
            right: -22,
            top: -30,
          }}
        />
      </View>
    </View>
  );
}

/** Estado-gerando: the stack of pages, the top one naming the current stage. */
function PilhaDePaginas({ rotulo }: { rotulo: string }) {
  return (
    <View
      style={{ height: 230, alignItems: 'center' }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {[
        { top: 18, x: 34, r: '7deg' },
        { top: 8, x: 16, r: '3deg' },
      ].map((p) => (
        <View
          key={p.r}
          style={{
            position: 'absolute',
            top: p.top,
            width: 150,
            height: 212,
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: '#E7E1D7',
            borderRadius: 6,
            transform: [{ translateX: p.x }, { rotate: p.r }],
          }}
        />
      ))}
      <View
        style={{
          position: 'absolute',
          top: 0,
          width: 150,
          height: 212,
          backgroundColor: '#FFFDF9',
          borderWidth: 1,
          borderColor: '#E7E1D7',
          borderRadius: 6,
          padding: 14,
          gap: 6,
          shadowColor: '#18212E',
          shadowOpacity: 0.14,
          shadowRadius: 17,
          shadowOffset: { width: 0, height: 14 },
          elevation: 5,
        }}
      >
        <Text
          allowFontScaling={false}
          style={{ fontSize: 7, fontFamily: fonts.bold, letterSpacing: 0.6, color: '#1F4F8F' }}
        >
          {rotulo.toUpperCase()}
        </Text>
        <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 3 }}>
          {['#E4ECF7', '#E4ECF7', '#FCE3E5', '#E4ECF7', '#EDE8DF', '#EDE8DF'].map((cor, i) => (
            <View
              key={i}
              style={{
                width: '30%',
                flexGrow: 1,
                height: '30%',
                backgroundColor: cor,
                borderRadius: 2,
              }}
            />
          ))}
        </View>
      </View>
    </View>
  );
}
