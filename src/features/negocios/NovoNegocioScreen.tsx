import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import {
  Button,
  Chip,
  Dialog,
  IconButton,
  IconX,
  Screen,
  Text,
  TextField,
} from '@/core/components';
import { useTranslation } from '@/core/i18n/useTranslation';
import { dismissToOnce, replaceOnce } from '@/core/navigation';
import { useTheme } from '@/core/theme';
import {
  atualizarNegocio,
  criarNegocio,
  ESTAGIOS,
  excluirNegocio,
  SEGMENTOS,
  type Estagio,
  type Negocio,
  type Segmento,
} from '@/data';

import { DESCRICAO_ESTAGIO, ROTULO_ESTAGIO, ROTULO_SEGMENTO } from './rotulos';

export type NovoNegocioProps = {
  /** Present when editing an existing business. */
  negocio?: Negocio;
};

/** Novo negócio (design Novo-negocio), also used to edit name, segment and stage. */
export function NovoNegocioScreen({ negocio }: NovoNegocioProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [nome, setNome] = useState(negocio?.nome ?? '');
  const [segmento, setSegmento] = useState<Segmento | null>(negocio?.segmento ?? null);
  const [estagio, setEstagio] = useState<Estagio | null>(negocio?.estagio ?? null);
  const [tentou, setTentou] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [excluir, setExcluir] = useState(false);

  const nomeVazio = nome.trim() === '';
  const pronto = !nomeVazio && segmento !== null && estagio !== null;

  function fechar() {
    if (router.canGoBack()) router.back();
    else replaceOnce('/');
  }

  function salvar() {
    setTentou(true);
    if (!pronto) return;
    const entrada = { nome, segmento, estagio };
    if (negocio) {
      atualizarNegocio(negocio.id, entrada);
      fechar();
      return;
    }
    const id = criarNegocio(entrada);
    if (id) replaceOnce({ pathname: '/negocio/[id]', params: { id } });
  }

  return (
    <Screen
      scroll
      gap={22}
      header={
        <IconButton
          icon={IconX}
          size={22}
          accessibilityLabel={t('common.close')}
          onPress={fechar}
        />
      }
      footer={
        <Button
          label={negocio ? t('novoNegocio.salvar') : t('novoNegocio.criar')}
          onPress={salvar}
          disabled={tentou && !pronto}
        />
      }
    >
      <Text variant="title" accessibilityRole="header" style={{ marginTop: -8 }}>
        {negocio ? t('novoNegocio.tituloEditar') : t('novoNegocio.titulo')}
      </Text>

      <TextField
        label={t('novoNegocio.nome')}
        value={nome}
        onChangeText={setNome}
        placeholder={t('novoNegocio.nomePlaceholder')}
        hint={t('novoNegocio.nomeDica')}
        error={tentou && nomeVazio ? t('novoNegocio.nomeErro') : null}
        autoFocus={!negocio}
        autoCapitalize="words"
        returnKeyType="done"
        maxLength={60}
      />

      <View style={{ gap: 10 }}>
        <Text variant="support" style={{ fontFamily: theme.fonts.bold }} nativeID="rotulo-segmento">
          {t('novoNegocio.segmento')}
        </Text>
        <View
          accessibilityRole="radiogroup"
          accessibilityLabelledBy="rotulo-segmento"
          style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}
        >
          {SEGMENTOS.map((s) => (
            <Chip
              key={s}
              label={t(ROTULO_SEGMENTO[s])}
              selected={segmento === s}
              onPress={() => setSegmento(s)}
            />
          ))}
        </View>
      </View>

      <View style={{ gap: 10 }}>
        <Text variant="support" style={{ fontFamily: theme.fonts.bold }} nativeID="rotulo-estagio">
          {t('novoNegocio.estagio')}
        </Text>
        <View
          accessibilityRole="radiogroup"
          accessibilityLabelledBy="rotulo-estagio"
          style={{ flexDirection: 'row', gap: 10 }}
        >
          {ESTAGIOS.map((e) => {
            const selecionado = estagio === e;
            return (
              <Pressable
                key={e}
                accessibilityRole="radio"
                accessibilityState={{ checked: selecionado }}
                accessibilityLabel={`${t(ROTULO_ESTAGIO[e])}. ${t(DESCRICAO_ESTAGIO[e])}`}
                onPress={() => setEstagio(e)}
                style={{
                  flex: 1,
                  minHeight: 96,
                  borderRadius: theme.radius.lg,
                  borderWidth: selecionado ? 2 : 1,
                  borderColor: selecionado ? theme.colors.primary : theme.colors.borderInput,
                  backgroundColor: selecionado ? theme.colors.primarySoft : theme.colors.surface,
                  padding: selecionado ? 14 : 15,
                  justifyContent: 'space-between',
                  gap: 6,
                }}
              >
                <Text
                  variant="bodyStrong"
                  style={{
                    fontSize: 16,
                    color: selecionado ? theme.colors.primaryText : theme.colors.text,
                  }}
                >
                  {t(ROTULO_ESTAGIO[e])}
                </Text>
                <Text
                  variant="caption"
                  style={{
                    fontSize: 13,
                    color: selecionado ? theme.colors.textBody : theme.colors.textMuted,
                  }}
                >
                  {t(DESCRICAO_ESTAGIO[e])}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {negocio ? (
        <Button
          variant="link"
          label={t('novoNegocio.excluir')}
          onPress={() => setConfirmarExclusao(true)}
          style={{ alignSelf: 'center' }}
        />
      ) : null}

      {negocio ? (
        <Dialog
          visible={confirmarExclusao}
          onDismiss={() => setConfirmarExclusao(false)}
          onFechado={() => {
            if (!excluir) return;
            excluirNegocio(negocio.id);
            dismissToOnce('/');
          }}
        >
          <Text variant="heading" accessibilityRole="header">
            {t('novoNegocio.excluirTitulo', { nome: negocio.nome })}
          </Text>
          <Text variant="support" color="textBody">
            {t('novoNegocio.excluirTexto')}
          </Text>
          <View style={{ gap: 8, marginTop: 8 }}>
            <Button
              variant="danger"
              label={t('novoNegocio.excluirConfirmar')}
              onPress={() => {
                setExcluir(true);
                setConfirmarExclusao(false);
              }}
            />
            <Button
              variant="secondary"
              label={t('common.cancel')}
              onPress={() => setConfirmarExclusao(false)}
            />
          </View>
        </Dialog>
      ) : null}
    </Screen>
  );
}
