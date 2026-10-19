import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { Button, IconButton, IconPlus, IconX, Screen, Text } from '@/core/components';
import { useTranslation } from '@/core/i18n/useTranslation';
import { replaceOnce } from '@/core/navigation';
import { useTheme } from '@/core/theme';
import { adicionarItemSwot, PARTES_SWOT, removerItemSwot, type SwotItem } from '@/data';

import { BarraSegmentada } from '../ui';
import { chaveParte, COR_PARTE } from './partes';

export type SwotProps = {
  negocioId: string;
  swot: SwotItem[];
  /** 0-based part to open on (from `?parte=n`, 1-based). */
  inicial?: number;
};

/**
 * SWOT (design Swot): one part at a time, each a short list. It is not the
 * single-text guided form — items are added and removed one by one, and every
 * change is saved at once.
 */
export function SwotScreen({ negocioId, swot, inicial = 0 }: SwotProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const total = PARTES_SWOT.length;
  const [indice, setIndice] = useState(Math.min(Math.max(0, inicial), total - 1));
  const [novo, setNovo] = useState('');
  const campo = useRef<TextInput>(null);
  const parte = PARTES_SWOT[indice]!;
  const itens = swot.filter((i) => i.parte === parte);
  const cor = COR_PARTE[parte];
  const ultimo = indice === total - 1;

  function adicionar() {
    if (!novo.trim()) return;
    adicionarItemSwot(negocioId, parte, novo);
    setNovo('');
    campo.current?.focus();
  }

  function irPara(i: number) {
    if (novo.trim()) adicionarItemSwot(negocioId, parte, novo);
    setNovo('');
    setIndice(i);
  }

  function sair() {
    if (novo.trim()) adicionarItemSwot(negocioId, parte, novo);
    if (router.canGoBack()) router.back();
    else replaceOnce({ pathname: '/negocio/[id]', params: { id: negocioId } });
  }

  return (
    <Screen
      scroll
      gap={18}
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
              {t('swot.titulo')}{' '}
              <Text variant="support" color="textMuted">
                {t('swot.tecnico')}
              </Text>
            </Text>
            <Text variant="caption" color="textMuted">
              {t('formulario.deTotal', { atual: indice + 1, total })}
            </Text>
          </View>
          <View style={{ paddingLeft: 10 }}>
            <BarraSegmentada
              total={total}
              atual={indice}
              feitos={PARTES_SWOT.map((_, i) => i < indice)}
              accessibilityLabel={t('swot.parteDe', { atual: indice + 1, total })}
            />
          </View>
        </View>
      }
      footer={
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button
            variant="secondary"
            label={t('common.back')}
            onPress={() => (indice === 0 ? sair() : irPara(indice - 1))}
            style={{ flex: 1 }}
          />
          {ultimo ? (
            <Button
              label={t('swot.verResultado')}
              onPress={() => {
                if (novo.trim()) adicionarItemSwot(negocioId, parte, novo);
                replaceOnce({ pathname: '/negocio/[id]/swot-revisao', params: { id: negocioId } });
              }}
              style={{ flex: 2 }}
            />
          ) : (
            <Button
              label={t('formulario.proxima')}
              onPress={() => irPara(indice + 1)}
              style={{ flex: 2 }}
            />
          )}
        </View>
      }
    >
      <View style={{ gap: 10, marginTop: 4 }}>
        <View
          style={{
            alignSelf: 'flex-start',
            borderRadius: theme.radius.pill,
            paddingVertical: 5,
            paddingHorizontal: 12,
            backgroundColor: theme.colors[cor.fundo],
          }}
        >
          <Text variant="captionStrong" style={{ color: theme.colors[cor.texto] }}>
            {`${t(chaveParte(parte, 'nome'))} · ${t(chaveParte(parte, 'tipo'))}`}
          </Text>
        </View>
        <Text variant="question" accessibilityRole="header">
          {t(chaveParte(parte, 'pergunta'))}
        </Text>
        <Text variant="support" color="textMuted">
          {t(chaveParte(parte, 'ajuda'))}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TextInput
          key={parte}
          ref={campo}
          value={novo}
          onChangeText={setNovo}
          onSubmitEditing={adicionar}
          submitBehavior="submit"
          returnKeyType="done"
          accessibilityLabel={t('swot.adicionarItem')}
          placeholder={t(chaveParte(parte, 'placeholder'))}
          placeholderTextColor={theme.colors.textFaint}
          selectionColor={theme.colors.primary}
          maxLength={120}
          style={{
            flex: 1,
            minHeight: 52,
            borderWidth: 2,
            borderColor: theme.colors.primary,
            borderRadius: theme.radius.input,
            backgroundColor: theme.colors.surface,
            paddingHorizontal: 14,
            fontFamily: theme.fonts.regular,
            fontSize: 16,
            color: theme.colors.text,
          }}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('swot.adicionar')}
          onPress={adicionar}
          style={({ pressed }) => ({
            width: 52,
            height: 52,
            borderRadius: theme.radius.input,
            backgroundColor: pressed ? theme.colors.primaryPressed : theme.colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
          })}
        >
          <IconPlus size={22} strokeWidth={2.2} color={theme.colors.onPrimary} />
        </Pressable>
      </View>

      {itens.length > 0 ? (
        <View style={{ gap: 8 }}>
          {itens.map((item) => (
            <View
              key={item.id}
              style={{
                backgroundColor: theme.colors.surface,
                borderWidth: 1,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.input,
                paddingVertical: 4,
                paddingRight: 4,
                paddingLeft: 16,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Text style={{ flex: 1, fontSize: 16, lineHeight: 22, paddingVertical: 10 }}>
                {item.texto}
              </Text>
              <IconButton
                icon={IconX}
                size={18}
                accessibilityLabel={t('swot.remover', { item: item.texto })}
                onPress={() => removerItemSwot(negocioId, item.id)}
              />
            </View>
          ))}
        </View>
      ) : (
        <View
          style={{
            borderWidth: 1,
            borderStyle: 'dashed',
            borderColor: theme.colors.textFaint,
            borderRadius: theme.radius.input,
            padding: 16,
            flexDirection: 'row',
            gap: 8,
          }}
        >
          <Text
            variant="caption"
            style={{ fontFamily: theme.fonts.bold, color: theme.colors.text }}
          >
            {t('formulario.exemplo')}
          </Text>
          <Text variant="caption" color="textMuted" style={{ flex: 1, lineHeight: 20 }}>
            {t(chaveParte(parte, 'exemplo'))}
          </Text>
        </View>
      )}

      <Text variant="caption" color="textMuted" style={{ fontSize: 13 }}>
        {t('swot.dica')}
      </Text>
    </Screen>
  );
}
