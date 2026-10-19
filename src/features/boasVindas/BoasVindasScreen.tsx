import { useState, type ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Button,
  IconButton,
  IconCheck,
  IconChevronLeft,
  IconPlus,
  LARGURA_MAXIMA,
  Text,
} from '@/core/components';
import { useTranslation } from '@/core/i18n/useTranslation';
import { fonts, useTheme } from '@/core/theme';

import { Logo } from '../ui';

const TOTAL = 3;

export type BoasVindasProps = {
  /** Ends the onboarding; `criar` when the person chose to start a plan right away. */
  onConcluir: (criar: boolean) => void;
};

/**
 * Onboarding in three steps (design Main → Onboarding-2 → Onboarding-3),
 * replacing the kit's generic one. "Pular" ends it from steps 1 and 2; only
 * shown on the first launch (the kit's `onboardingCompleted` flag in MMKV).
 */
export function BoasVindasScreen({ onConcluir }: BoasVindasProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [passo, setPasso] = useState(0);
  const ultimo = passo === TOTAL - 1;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View
        style={{
          width: '100%',
          maxWidth: LARGURA_MAXIMA,
          alignSelf: 'center',
          paddingTop: insets.top + 8,
          paddingHorizontal: 24,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: insets.top + 52,
        }}
      >
        {passo === 0 ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Logo size={32} />
            <View>
              <Text variant="subheading" style={{ fontSize: 19, lineHeight: 21 }}>
                {t('common.appName')}
              </Text>
              <Text variant="caption" color="textMuted" style={{ fontSize: 12, lineHeight: 16 }}>
                {t('common.appSubtitle')}
              </Text>
            </View>
          </View>
        ) : (
          <IconButton
            icon={IconChevronLeft}
            accessibilityLabel={t('common.back')}
            onPress={() => setPasso(passo - 1)}
            style={{ marginLeft: -10 }}
          />
        )}
        {ultimo ? null : (
          <Button
            variant="link"
            label={t('boasVindas.pular')}
            underline={false}
            onPress={() => onConcluir(false)}
            style={{ paddingHorizontal: 4 }}
          />
        )}
      </View>

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          width: '100%',
          maxWidth: LARGURA_MAXIMA,
          alignSelf: 'center',
          paddingHorizontal: 24,
          paddingTop: 8,
          paddingBottom: insets.bottom + 24,
          gap: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flex: 1, justifyContent: 'center', minHeight: 260 }}>
          {passo === 0 ? <CenaConversa /> : passo === 1 ? <CenaPlanos /> : <CenaDocumento />}
        </View>

        <View style={{ gap: 12 }}>
          <Text variant="display" accessibilityRole="header">
            {t(
              passo === 0
                ? 'boasVindas.titulo1'
                : passo === 1
                  ? 'boasVindas.titulo2'
                  : 'boasVindas.titulo3',
            )}
          </Text>
          <Text variant="body" color="textMuted">
            {t(
              passo === 0
                ? 'boasVindas.texto1'
                : passo === 1
                  ? 'boasVindas.texto2'
                  : 'boasVindas.texto3',
            )}
          </Text>
        </View>

        <View style={{ gap: 20 }}>
          <View
            accessible
            accessibilityLabel={t('boasVindas.passo', { atual: passo + 1, total: TOTAL })}
            style={{ flexDirection: 'row', gap: 6, justifyContent: 'center' }}
          >
            {Array.from({ length: TOTAL }, (_, i) => (
              <View
                key={i}
                style={{
                  width: i === passo ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: i === passo ? theme.colors.primary : theme.colors.borderInput,
                }}
              />
            ))}
          </View>
          {ultimo ? (
            <Button
              label={t('boasVindas.criarPrimeiro')}
              icon={IconPlus}
              onPress={() => onConcluir(true)}
            />
          ) : (
            <Button label={t('common.continue')} onPress={() => setPasso(passo + 1)} />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

/** Step 1: a question, an answer and the "Boa!" chip, as a chat. */
function CenaConversa() {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <View
      style={{ gap: 14, paddingHorizontal: 4 }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View
        style={{
          alignSelf: 'flex-start',
          maxWidth: 270,
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: 20,
          borderBottomLeftRadius: 6,
          paddingVertical: 16,
          paddingHorizontal: 18,
          gap: 6,
          shadowColor: '#18212E',
          shadowOpacity: 0.06,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 8 },
        }}
      >
        <Text variant="label" color="primaryText" style={{ fontSize: 12 }}>
          {t('boasVindas.bolhaRotulo')}
        </Text>
        <Text variant="subheading" style={{ fontSize: 19, lineHeight: 24 }}>
          {t('boasVindas.bolhaPergunta')}
        </Text>
      </View>
      <View
        style={{
          alignSelf: 'flex-end',
          maxWidth: 250,
          backgroundColor: theme.colors.primary,
          borderRadius: 20,
          borderBottomRightRadius: 6,
          paddingVertical: 14,
          paddingHorizontal: 18,
        }}
      >
        <Text style={{ color: theme.colors.onPrimary, fontSize: 16, lineHeight: 22 }}>
          {t('boasVindas.bolhaResposta')}
        </Text>
      </View>
      <View
        style={{
          alignSelf: 'flex-start',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          backgroundColor: theme.colors.primarySoft,
          borderRadius: theme.radius.pill,
          paddingVertical: 8,
          paddingHorizontal: 14,
        }}
      >
        <IconCheck size={16} strokeWidth={2.4} color={theme.colors.primaryText} />
        <Text
          variant="support"
          style={{ color: theme.colors.primaryText, fontFamily: theme.fonts.bold, fontSize: 14 }}
        >
          {t('boasVindas.bolhaConfirma')}
        </Text>
      </View>
    </View>
  );
}

/** Step 2: what is free and what the one-time unlock adds. */
function CenaPlanos() {
  const theme = useTheme();
  const { t } = useTranslation();
  const itens = [
    t('boasVindas.gratisItem1'),
    t('boasVindas.gratisItem2'),
    t('boasVindas.gratisItem3'),
    t('boasVindas.gratisItem4'),
  ];
  return (
    <View style={{ gap: 12 }}>
      <CardPlano titulo={t('boasVindas.gratisTitulo')} selo={t('boasVindas.gratisSelo')}>
        <View style={{ gap: 10 }}>
          {itens.map((item) => (
            <View key={item} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <IconCheck size={18} strokeWidth={2.4} color={theme.colors.primaryText} />
              <Text variant="support" color="textBody" style={{ flex: 1 }}>
                {item}
              </Text>
            </View>
          ))}
        </View>
      </CardPlano>
      <CardPlano tint titulo={t('boasVindas.completoTitulo')} selo={t('boasVindas.completoSelo')}>
        <Text variant="support" color="textBody">
          {t('boasVindas.completoTexto')}
        </Text>
        <Text variant="support" style={{ fontFamily: theme.fonts.bold }}>
          {t('boasVindas.completoPreco')}
        </Text>
      </CardPlano>
    </View>
  );
}

function CardPlano({
  titulo,
  selo,
  tint = false,
  children,
}: {
  titulo: string;
  selo: string;
  tint?: boolean;
  children: ReactNode;
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        backgroundColor: tint ? theme.colors.primarySoft : theme.colors.surface,
        borderWidth: 1,
        borderColor: tint ? theme.colors.primarySoftBorder : theme.colors.border,
        borderRadius: theme.radius.card,
        padding: 20,
        gap: tint ? 10 : 14,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Text variant="subheading" style={{ fontSize: 18, flexShrink: 1 }}>
          {titulo}
        </Text>
        <View
          style={{
            backgroundColor: tint ? theme.colors.primary : theme.colors.primarySoft,
            borderRadius: theme.radius.pill,
            paddingVertical: 5,
            paddingHorizontal: 12,
          }}
        >
          <Text
            variant="caption"
            style={{
              fontFamily: theme.fonts.bold,
              color: tint ? theme.colors.onPrimary : theme.colors.primaryText,
            }}
          >
            {selo}
          </Text>
        </View>
      </View>
      {children}
    </View>
  );
}

/** Step 3: the PDF cover, tilted over the SWOT page. Light paper in both themes. */
function CenaDocumento() {
  const { t } = useTranslation();
  return (
    <View
      style={{ height: 260, alignItems: 'center', justifyContent: 'center' }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View
        style={{
          position: 'absolute',
          width: 150,
          height: 212,
          backgroundColor: '#FFFFFF',
          borderWidth: 1,
          borderColor: '#E7E1D7',
          borderRadius: 6,
          transform: [{ translateX: 70 }, { translateY: 14 }, { rotate: '6deg' }],
          padding: 14,
          gap: 6,
          shadowColor: '#18212E',
          shadowOpacity: 0.08,
          shadowRadius: 15,
          shadowOffset: { width: 0, height: 10 },
          elevation: 3,
        }}
      >
        <Text
          allowFontScaling={false}
          style={{ fontSize: 7, fontFamily: fonts.bold, letterSpacing: 0.6, color: '#1F4F8F' }}
        >
          {t('boasVindas.docSwot').toUpperCase()}
        </Text>
        <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
          {['#E4ECF7', '#FCE3E5', '#EDF0F4', '#ECE7F5'].map((cor) => (
            <View
              key={cor}
              style={{ width: '47%', flexGrow: 1, backgroundColor: cor, borderRadius: 3 }}
            />
          ))}
        </View>
      </View>
      <View
        style={{
          width: 170,
          height: 240,
          backgroundColor: '#FFFDF9',
          borderWidth: 1,
          borderColor: '#E7E1D7',
          borderRadius: 6,
          transform: [{ translateX: -40 }, { rotate: '-4deg' }],
          overflow: 'hidden',
          shadowColor: '#18212E',
          shadowOpacity: 0.14,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 16 },
          elevation: 6,
        }}
      >
        <View style={{ paddingTop: 16, paddingHorizontal: 14, gap: 4 }}>
          <Text
            allowFontScaling={false}
            style={{ fontSize: 7, fontFamily: fonts.bold, letterSpacing: 0.7, color: '#1F4F8F' }}
          >
            {t('boasVindas.docRotulo').toUpperCase()}
          </Text>
          <Text
            allowFontScaling={false}
            style={{ fontFamily: fonts.display, fontSize: 22, lineHeight: 23, color: '#18212E' }}
          >
            {t('boasVindas.docNome')}
          </Text>
          <Text allowFontScaling={false} style={{ fontSize: 7, color: '#545F6E' }}>
            {t('boasVindas.docSub')}
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
    </View>
  );
}
