import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Linking, Pressable, Switch, View } from 'react-native';

import {
  Button,
  Dialog,
  IconButton,
  IconChevronLeft,
  IconChevronRight,
  Screen,
  Segmented,
  Text,
} from '@/core/components';
import { env } from '@/core/config';
import type { AppLocale, LocalePreference } from '@/core/i18n';
import { useTranslation } from '@/core/i18n/useTranslation';
import { pushOnce, replaceOnce } from '@/core/navigation';
import { useRatingPrompt } from '@/core/rating';
import { isPersistentStorageAvailable, useConfigStore, type ThemePreference } from '@/core/storage';
import { useTheme } from '@/core/theme';
import { isDatabaseAvailable } from '@/data';

import { criarNegocioExemplo } from '../negocios/exemplo';
import { CartaoDesbloqueio } from './CartaoDesbloqueio';

/**
 * Ajustes (design Ajustes): the unlock, appearance, language, about and the
 * license credits for the Lean Canvas and the BMC (CC BY-SA 3.0).
 *
 * The design's credits card is replaced by the unlock card plus "Restaurar
 * compra", which the App Store requires for a non-consumable.
 */
export function AjustesScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const tema = useConfigStore((state) => state.theme);
  const setTema = useConfigStore((state) => state.setTheme);
  const idioma = useConfigStore((state) => state.locale);
  const setIdioma = useConfigStore((state) => state.setLocale);
  const { rateNow } = useRatingPrompt();
  const [comoFunciona, setComoFunciona] = useState(false);

  const versao = Constants.expoConfig?.version ?? '';

  function voltar() {
    if (router.canGoBack()) router.back();
    else replaceOnce('/');
  }

  return (
    <Screen
      scroll
      gap={18}
      header={
        <IconButton icon={IconChevronLeft} accessibilityLabel={t('common.back')} onPress={voltar} />
      }
    >
      <Text variant="title" accessibilityRole="header" style={{ marginTop: -6 }}>
        {t('ajustes.titulo')}
      </Text>

      <CartaoDesbloqueio />

      <Secao titulo={t('ajustes.aparencia')}>
        <Segmented<ThemePreference>
          accessibilityLabel={t('ajustes.aparencia')}
          value={tema}
          onChange={setTema}
          options={[
            { value: 'system', label: t('ajustes.temaSistema') },
            { value: 'light', label: t('ajustes.temaClaro') },
            { value: 'dark', label: t('ajustes.temaEscuro') },
          ]}
        />
      </Secao>

      <Secao titulo={t('ajustes.idioma')}>
        <Segmented<LocalePreference>
          accessibilityLabel={t('ajustes.idioma')}
          value={idioma}
          onChange={setIdioma}
          options={[
            { value: 'system', label: t('ajustes.idiomaSistema') },
            ...IDIOMAS.map((value) => ({ value, label: NOME_IDIOMA[value] })),
          ]}
        />
      </Secao>

      <Secao titulo={t('ajustes.sobre')}>
        <Grupo>
          <Linha label={t('ajustes.comoFunciona')} onPress={() => setComoFunciona(true)} />
          {env.links.supportEmail ? (
            <Linha
              label={t('ajustes.fale')}
              onPress={() =>
                void Linking.openURL(
                  `mailto:${env.links.supportEmail}?subject=${encodeURIComponent(t('ajustes.emailAssunto'))}`,
                )
              }
            />
          ) : null}
          {env.links.privacyUrl ? (
            <Linha
              label={t('ajustes.privacidade')}
              onPress={() => void Linking.openURL(env.links.privacyUrl)}
            />
          ) : null}
          {env.links.termsUrl ? (
            <Linha
              label={t('ajustes.termos')}
              onPress={() => void Linking.openURL(env.links.termsUrl)}
            />
          ) : null}
          <Linha label={t('ajustes.avaliar')} onPress={() => void rateNow()} />
          <Linha label={t('ajustes.versao')} valor={versao} ultima />
        </Grupo>
      </Secao>

      <Secao titulo={t('ajustes.licencas')}>
        <View
          style={{
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.lg,
            paddingVertical: 14,
            paddingHorizontal: 16,
            gap: 10,
          }}
        >
          <Licenca nome={t('ajustes.licencaLeanNome')} texto={t('ajustes.licencaLean')} />
          <Licenca nome={t('ajustes.licencaBmcNome')} texto={t('ajustes.licencaBmc')} />
        </View>
      </Secao>

      {__DEV__ ? <SecaoDev /> : null}

      <Dialog visible={comoFunciona} onDismiss={() => setComoFunciona(false)}>
        <Text variant="heading" accessibilityRole="header">
          {t('ajustes.comoFuncionaTitulo')}
        </Text>
        <Text variant="support" color="textBody">
          {t('ajustes.comoFuncionaTexto')}
        </Text>
        <Button
          label={t('common.ok')}
          onPress={() => setComoFunciona(false)}
          style={{ marginTop: 8 }}
        />
      </Dialog>
    </Screen>
  );
}

const IDIOMAS: readonly AppLocale[] = ['pt-BR', 'en', 'es'];

/** Each language in its own name, as language pickers do: not translated. */
const NOME_IDIOMA: Record<AppLocale, string> = {
  'pt-BR': 'Português',
  en: 'English',
  es: 'Español',
};

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <View style={{ gap: 8 }}>
      <Text variant="label" color="textMuted" accessibilityRole="header">
        {titulo}
      </Text>
      {children}
    </View>
  );
}

function Grupo({ children }: { children: ReactNode }) {
  const theme = useTheme();
  return (
    <View
      style={{
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.lg,
        overflow: 'hidden',
      }}
    >
      {children}
    </View>
  );
}

function Linha({
  label,
  valor,
  onPress,
  ultima = false,
}: {
  label: string;
  valor?: string;
  onPress?: () => void;
  ultima?: boolean;
}) {
  const theme = useTheme();
  const conteudo = (pressed: boolean) => (
    <View
      style={{
        minHeight: 52,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        borderBottomWidth: ultima ? 0 : 1,
        borderBottomColor: theme.colors.divider,
        backgroundColor: pressed ? theme.colors.surfaceElevated : 'transparent',
      }}
    >
      <Text style={{ fontSize: 16, flexShrink: 1 }}>{label}</Text>
      {valor !== undefined ? (
        <Text variant="support" color="textMuted">
          {valor}
        </Text>
      ) : (
        <IconChevronRight size={18} strokeWidth={2} color={theme.colors.textFaint} />
      )}
    </View>
  );

  if (!onPress) return conteudo(false);
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress}>
      {({ pressed }) => conteudo(pressed)}
    </Pressable>
  );
}

function Licenca({ nome, texto }: { nome: string; texto: string }) {
  const theme = useTheme();
  return (
    <Text variant="caption" color="textBody" style={{ lineHeight: 20 }}>
      <Text variant="caption" style={{ fontFamily: theme.fonts.bold, color: theme.colors.text }}>
        {nome}
      </Text>
      {` — ${texto}`}
    </Text>
  );
}

/** `__DEV__` only, dropped from release bundles, like the kit's "Simulate unlock". */
function SecaoDev() {
  const theme = useTheme();
  const { t } = useTranslation();
  const devUnlock = useConfigStore((state) => state.devUnlock);
  const setDevUnlock = useConfigStore((state) => state.setDevUnlock);
  const resetOnboarding = useConfigStore((state) => state.resetOnboarding);

  return (
    <Secao titulo={t('ajustes.devTitulo')}>
      <Grupo>
        <View
          style={{
            minHeight: 60,
            paddingHorizontal: 16,
            paddingVertical: 10,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.divider,
          }}
        >
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={{ fontSize: 16 }}>{t('ajustes.devSimular')}</Text>
            <Text variant="caption" color="textMuted">
              {t('ajustes.devSimularDica')}
            </Text>
          </View>
          <Switch
            accessibilityLabel={t('ajustes.devSimular')}
            value={devUnlock === true}
            onValueChange={(ligado) => setDevUnlock(ligado ? true : null)}
            trackColor={{ true: theme.colors.primary, false: theme.colors.borderInput }}
          />
        </View>
        <Linha
          label={t('ajustes.devExemplo')}
          onPress={() => {
            const id = criarNegocioExemplo();
            if (id) pushOnce({ pathname: '/negocio/[id]', params: { id } });
          }}
        />
        <Linha label={t('ajustes.devBoasVindas')} onPress={resetOnboarding} ultima />
      </Grupo>
      {isDatabaseAvailable() ? null : (
        <Text variant="caption" color="danger">
          {t('ajustes.devSemBanco')}
        </Text>
      )}
      {isPersistentStorageAvailable() ? null : (
        <Text variant="caption" color="danger">
          {t('ajustes.devSemMmkv')}
        </Text>
      )}
    </Secao>
  );
}
