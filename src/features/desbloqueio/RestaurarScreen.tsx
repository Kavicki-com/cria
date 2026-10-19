import { router } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';

import {
  Button,
  IconAlert,
  IconCheck,
  IconRefresh,
  Screen,
  Text,
  type Icon,
} from '@/core/components';
import { useTranslation } from '@/core/i18n/useTranslation';
import { dismissToOnce, replaceOnce } from '@/core/navigation';
import { useUnlock } from '@/core/purchases';
import { useTheme } from '@/core/theme';

type Estado = 'procurando' | 'restaurada' | 'nada' | 'erro';

/**
 * Restaurar compra (from Ajustes or the paywall): asks the store on open,
 * then says what it found — as Churrapp's RestaurarScreen. The App Store
 * requires this for a non-consumable.
 */
export function RestaurarScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { restore } = useUnlock();
  const [estado, setEstado] = useState<Estado>('procurando');

  useEffect(() => {
    let vivo = true;
    void restore().then((r) => {
      if (!vivo) return;
      setEstado(
        r.status === 'unlocked'
          ? 'restaurada'
          : r.status === 'nothing-to-restore'
            ? 'nada'
            : 'erro',
      );
    });
    return () => {
      vivo = false;
    };
    // Once per visit: `restore` is a stable store action.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (estado === 'procurando') {
    return (
      <View
        accessibilityLiveRegion="polite"
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text variant="support" color="textMuted">
          {t('desbloqueio.procurando')}
        </Text>
      </View>
    );
  }

  const fechar = () => (router.canGoBack() ? router.back() : replaceOnce('/'));

  if (estado === 'restaurada') {
    return (
      <Resultado
        icone={IconCheck}
        sucesso
        titulo={t('desbloqueio.restauradaTitulo')}
        texto={t('desbloqueio.restauradaTexto')}
        rodape={<Button label={t('desbloqueio.voltarInicio')} onPress={() => dismissToOnce('/')} />}
      />
    );
  }

  return (
    <Resultado
      icone={estado === 'nada' ? IconRefresh : IconAlert}
      titulo={
        estado === 'nada' ? t('desbloqueio.nadaTitulo') : t('desbloqueio.restaurarErroTitulo')
      }
      texto={estado === 'nada' ? t('desbloqueio.nadaTexto') : t('desbloqueio.restaurarErro')}
      rodape={
        <>
          <Button label={t('desbloqueio.verDesbloqueio')} onPress={() => replaceOnce('/paywall')} />
          <Button variant="secondary" label={t('common.close')} onPress={fechar} />
        </>
      }
    />
  );
}

function Resultado({
  icone: Glyph,
  sucesso = false,
  titulo,
  texto,
  rodape,
}: {
  icone: Icon;
  sucesso?: boolean;
  titulo: string;
  texto: string;
  rodape: ReactNode;
}) {
  const theme = useTheme();
  return (
    <Screen
      footer={rodape}
      contentStyle={{ alignItems: 'center', justifyContent: 'center', gap: 14 }}
    >
      <View
        style={{
          width: 112,
          height: 112,
          borderRadius: 56,
          marginBottom: 12,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: sucesso ? theme.colors.successSoft : theme.colors.primarySoft,
        }}
      >
        <Glyph
          size={48}
          strokeWidth={2.2}
          color={sucesso ? theme.colors.onSuccessSoft : theme.colors.primaryText}
        />
      </View>
      <Text variant="title" center accessibilityRole="header">
        {titulo}
      </Text>
      <Text variant="body" color="textMuted" center style={{ maxWidth: 320 }}>
        {texto}
      </Text>
    </Screen>
  );
}
