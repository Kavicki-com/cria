import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';

import {
  Button,
  IconArrowRight,
  IconButton,
  IconCheck,
  IconInfo,
  IconX,
  Screen,
  Text,
  TextField,
} from '@/core/components';
import { useTranslation } from '@/core/i18n/useTranslation';
import { replaceOnce } from '@/core/navigation';
import { useTheme } from '@/core/theme';
import { pularResposta, salvarResposta, type Quadro, type RespostasPorQuadro } from '@/data';

import { ROTULO_PARTE } from '../negocios/rotulos';
import { BarraSegmentada, IlustracaoPersona } from '../ui';
import {
  BMC_DO_LEAN,
  CAMPO_ILUSTRACAO,
  ILUSTRACAO_PADRAO,
  QUADROS,
  type Ilustracao,
} from './definicoes';
import { chaveCampo, PARTE_DO_QUADRO } from './textos';

export type FormularioGuiadoProps = {
  negocioId: string;
  quadro: Quadro;
  respostas: RespostasPorQuadro;
  /** 0-based question to open on (from `?pergunta=n`, which is 1-based). */
  inicial?: number;
};

/**
 * One question at a time (design Formulario / Persona), for the Lean Canvas,
 * the BMC and the Persona. The questions are data (`definicoes.ts`); the copy
 * is in the locales.
 *
 * Every answer saves when the person leaves the field or the question — there
 * is no save button. "Pular por enquanto" marks the field skipped.
 */
export function FormularioGuiado({
  negocioId,
  quadro,
  respostas,
  inicial = 0,
}: FormularioGuiadoProps) {
  const total = QUADROS[quadro].campos.length;
  const [indice, setIndice] = useState(Math.min(Math.max(0, inicial), total - 1));

  // Opening the BMC for the first time: the five fields the Lean Canvas
  // already answered come pre-filled from it (plan §4). Decided once, at
  // mount; from then on they are ordinary answers, and "veio da sua ideia"
  // shows while they still match.
  const [sugestoes] = useState<Record<string, string>>(() => {
    if (quadro !== 'bmc' || Object.keys(respostas.bmc).length > 0) return {};
    const doLean: Record<string, string> = {};
    for (const [campoBmc, campoLean] of Object.entries(BMC_DO_LEAN)) {
      const texto = respostas.lean[campoLean]?.texto.trim();
      if (texto) doLean[campoBmc] = texto;
    }
    return doLean;
  });
  useEffect(() => {
    for (const [campo, texto] of Object.entries(sugestoes)) {
      salvarResposta(negocioId, 'bmc', campo, texto);
    }
  }, [negocioId, sugestoes]);

  const campo = QUADROS[quadro].campos[indice]!;
  return (
    <Pergunta
      // A new question mounts fresh, with its saved answer as the initial text.
      key={campo}
      negocioId={negocioId}
      quadro={quadro}
      respostas={respostas}
      indice={indice}
      setIndice={setIndice}
      textoInicial={respostas[quadro][campo]?.texto ?? sugestoes[campo] ?? ''}
    />
  );
}

function Pergunta({
  negocioId,
  quadro,
  respostas,
  indice,
  setIndice,
  textoInicial,
}: {
  negocioId: string;
  quadro: Quadro;
  respostas: RespostasPorQuadro;
  indice: number;
  setIndice: (indice: number) => void;
  textoInicial: string;
}) {
  const theme = useTheme();
  const { t } = useTranslation();
  const campos = QUADROS[quadro].campos;
  const total = campos.length;
  const persona = quadro === 'persona';
  const campo = campos[indice]!;
  const [texto, setTexto] = useState(textoInicial);
  const [ajudaAberta, setAjudaAberta] = useState(true);
  const ultimoSalvo = useRef(textoInicial);

  function salvar() {
    if (texto.trim() === ultimoSalvo.current.trim()) return;
    salvarResposta(negocioId, quadro, campo, texto);
    ultimoSalvo.current = texto;
  }

  function sair() {
    salvar();
    if (router.canGoBack()) router.back();
    else replaceOnce({ pathname: '/negocio/[id]', params: { id: negocioId } });
  }

  function irPara(proximo: number) {
    salvar();
    setIndice(proximo);
  }

  function concluir() {
    salvar();
    const revisao = persona
      ? '/negocio/[id]/persona-revisao'
      : quadro === 'bmc'
        ? '/negocio/[id]/bmc-revisao'
        : '/negocio/[id]/lean-revisao';
    replaceOnce({ pathname: revisao, params: { id: negocioId } });
  }

  function pular() {
    if (texto.trim()) salvar();
    else pularResposta(negocioId, quadro, campo);
    setIndice(indice + 1);
  }

  const ultimo = indice === total - 1;
  const veioDaIdeia =
    quadro === 'bmc' &&
    BMC_DO_LEAN[campo] !== undefined &&
    texto.trim() !== '' &&
    texto.trim() === respostas.lean[BMC_DO_LEAN[campo]!]?.texto.trim();

  const feitos = campos.map((c, i) =>
    persona
      ? Boolean(respostas.persona[c]?.texto.trim()) || (i === indice && texto.trim() !== '')
      : i < indice,
  );

  return (
    <Screen
      scroll
      gap={persona ? 18 : 22}
      header={
        <View style={{ flex: 1, gap: 10, paddingRight: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <IconButton
              icon={IconX}
              size={22}
              accessibilityLabel={t('formulario.fecharSalvar')}
              onPress={sair}
            />
            <Text
              variant="support"
              style={{ flex: 1, fontFamily: theme.fonts.bold }}
              numberOfLines={1}
            >
              {t(ROTULO_PARTE[PARTE_DO_QUADRO[quadro]])}
            </Text>
            <Text variant="caption" color="textMuted">
              {t('formulario.deTotal', { atual: indice + 1, total })}
            </Text>
          </View>
          <View style={{ paddingLeft: 10 }}>
            <BarraSegmentada
              total={total}
              atual={indice}
              feitos={feitos}
              accessibilityLabel={t('formulario.perguntaDe', { atual: indice + 1, total })}
            />
          </View>
        </View>
      }
      footer={
        <View style={{ gap: 6 }}>
          {ultimo ? null : (
            <Button
              variant="link"
              label={t('formulario.pular')}
              onPress={pular}
              style={{ alignSelf: 'center', paddingHorizontal: 16 }}
            />
          )}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button
              variant="secondary"
              label={t('common.back')}
              onPress={() => (indice === 0 ? sair() : irPara(indice - 1))}
              style={{ flex: 1 }}
            />
            {ultimo ? (
              <Button
                label={persona ? t('formulario.verResultado') : t('formulario.concluir')}
                icon={persona ? undefined : IconCheck}
                onPress={concluir}
                style={{ flex: 2 }}
              />
            ) : (
              <Button
                label={t('formulario.proxima')}
                onPress={() => irPara(indice + 1)}
                style={{ flex: 2 }}
                accessibilityHint={t('formulario.perguntaDe', { atual: indice + 2, total })}
              />
            )}
          </View>
        </View>
      }
    >
      {persona ? (
        <CabecalhoPersona
          negocioId={negocioId}
          respostas={respostas}
          nomeAtual={indice === 0 ? texto : undefined}
        />
      ) : null}

      <View style={{ gap: 10, marginTop: persona ? 4 : 8 }}>
        <Text variant="label" color="primaryText">
          {t(chaveCampo(quadro, campo, 'bloco'))}
        </Text>
        <Text
          variant="question"
          accessibilityRole="header"
          style={persona ? { fontSize: 26, lineHeight: 33 } : undefined}
        >
          {t(chaveCampo(quadro, campo, 'pergunta'))}
        </Text>
        {persona ? (
          <Text variant="support" color="textMuted">
            {t(chaveCampo(quadro, campo, 'ajuda'))}
          </Text>
        ) : null}
      </View>

      {persona ? null : (
        <View
          style={{
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.input,
            paddingHorizontal: 16,
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: ajudaAberta }}
            onPress={() => setAjudaAberta(!ajudaAberta)}
            style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8 }}
          >
            <IconInfo size={18} strokeWidth={2} color={theme.colors.primaryText} />
            <Text
              variant="support"
              style={{ flex: 1, color: theme.colors.primaryText, fontFamily: theme.fonts.bold }}
            >
              {t('formulario.porQueImporta')}
            </Text>
            <Text variant="caption" color="textMuted" style={{ fontSize: 13 }}>
              {ajudaAberta ? t('formulario.fechar') : t('formulario.abrir')}
            </Text>
          </Pressable>
          {ajudaAberta ? (
            <Text variant="support" color="textBody" style={{ marginBottom: 16 }}>
              {t(chaveCampo(quadro, campo, 'ajuda'))}
            </Text>
          ) : null}
        </View>
      )}

      <View style={{ gap: 8 }}>
        <Text variant="caption" color="textMuted">
          {t('formulario.suaResposta')}
        </Text>
        <TextField
          key={`${quadro}-${campo}`}
          accessibilityLabel={t(chaveCampo(quadro, campo, 'pergunta'))}
          value={texto}
          onChangeText={setTexto}
          onBlur={salvar}
          multiline
          placeholder={persona ? t('formulario.placeholderPersona') : t('formulario.placeholder')}
          maxLength={500}
        />
        {veioDaIdeia ? (
          <View
            style={{
              alignSelf: 'flex-start',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: theme.colors.primarySoft,
              borderRadius: theme.radius.pill,
              paddingVertical: 4,
              paddingHorizontal: 10,
            }}
          >
            <IconArrowRight size={14} strokeWidth={2.2} color={theme.colors.primaryText} />
            <Text variant="caption" style={{ fontSize: 13, color: theme.colors.primaryText }}>
              {t('formulario.veioDaIdeia')}
            </Text>
          </View>
        ) : null}
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
          <Text
            variant="caption"
            style={{ fontFamily: theme.fonts.bold, color: theme.colors.text }}
          >
            {t('formulario.exemplo')}
          </Text>
          <Text variant="caption" color="textMuted" style={{ flex: 1, lineHeight: 20 }}>
            {t(chaveCampo(quadro, campo, 'exemplo'))}
          </Text>
        </View>
      </View>
    </Screen>
  );
}

/** The persona's summary card and the illustration picker (design Persona). */
function CabecalhoPersona({
  negocioId,
  respostas,
  nomeAtual,
}: {
  negocioId: string;
  respostas: RespostasPorQuadro;
  /** What is being typed in "Quem é", so the card follows it live. */
  nomeAtual?: string;
}) {
  const theme = useTheme();
  const { t } = useTranslation();
  const ilustracao =
    (respostas.persona[CAMPO_ILUSTRACAO]?.texto as Ilustracao | undefined) ?? ILUSTRACAO_PADRAO;
  const nome = (nomeAtual ?? respostas.persona.quem?.texto ?? '').trim();
  const rotina = respostas.persona.rotina?.texto.trim();
  const preenchidas = QUADROS.persona.campos.filter((c) =>
    respostas.persona[c]?.texto.trim(),
  ).length;
  const genero = t(ilustracao === 'homem' ? 'formulario.homem' : 'formulario.mulher').toLowerCase();

  return (
    <View style={{ gap: 10 }}>
      <View
        style={{
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.lg,
          paddingVertical: 12,
          paddingHorizontal: 14,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <IlustracaoPersona
          tipo={ilustracao}
          size={44}
          accessibilityLabel={t('formulario.ilustracaoRotulo', {
            genero,
            nome: nome || t('formulario.personaPadrao'),
          })}
        />
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="support" style={{ fontFamily: theme.fonts.bold }} numberOfLines={1}>
            {nome || t('formulario.personaPadrao')}
          </Text>
          <Text variant="caption" color="textMuted" style={{ fontSize: 13 }} numberOfLines={1}>
            {rotina ||
              t('formulario.respostasDe', { n: preenchidas, total: QUADROS.persona.campos.length })}
          </Text>
        </View>
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          paddingHorizontal: 2,
        }}
      >
        <Text variant="caption" color="textMuted" nativeID="rotulo-ilustracao">
          {t('formulario.ilustracao')}
        </Text>
        <View
          accessibilityRole="radiogroup"
          accessibilityLabelledBy="rotulo-ilustracao"
          style={{ flexDirection: 'row', gap: 8 }}
        >
          {(['mulher', 'homem'] as const).map((opcao) => {
            const selecionada = opcao === ilustracao;
            return (
              <Pressable
                key={opcao}
                accessibilityRole="radio"
                accessibilityState={{ checked: selecionada }}
                accessibilityLabel={t(opcao === 'homem' ? 'formulario.homem' : 'formulario.mulher')}
                onPress={() => salvarResposta(negocioId, 'persona', CAMPO_ILUSTRACAO, opcao)}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  borderWidth: selecionada ? 2 : 1,
                  borderColor: selecionada ? theme.colors.primary : theme.colors.border,
                  backgroundColor: theme.colors.surface,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: selecionada ? 1 : 0.75,
                }}
              >
                <IlustracaoPersona tipo={opcao} size={36} />
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
