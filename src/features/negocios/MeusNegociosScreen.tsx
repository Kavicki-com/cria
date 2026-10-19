import { useEffect } from 'react';
import { Pressable, View } from 'react-native';

import { Button, IconButton, IconPlus, IconSliders, Screen, Text } from '@/core/components';
import { useTranslation } from '@/core/i18n/useTranslation';
import { pushOnce } from '@/core/navigation';
import { useUnlock } from '@/core/purchases';
import { useTheme } from '@/core/theme';
import { isDatabaseAvailable } from '@/data';

import { BarraProgresso, Degraus, SeloLiberado } from '../ui';
import { consumirPedidoNovoNegocio } from './intencao';
import { parteComecada, proximaParte } from './progresso';
import { ROTULO_ESTAGIO, ROTULO_PARTE, ROTULO_SEGMENTO } from './rotulos';
import { useNegocios, type NegocioComProgresso } from './useDados';

/** Meus negócios (design Meus-negocios / Estado-vazio): the app's home. */
export function MeusNegociosScreen() {
  const { t } = useTranslation();
  const negocios = useNegocios();

  useEffect(() => {
    if (consumirPedidoNovoNegocio()) pushOnce('/negocio/novo');
  }, []);

  const cabecalho = (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 4,
      }}
    >
      <Text variant="title" style={{ fontSize: 32, lineHeight: 38 }} accessibilityRole="header">
        {t('negocios.titulo')}
      </Text>
      <IconButton
        icon={IconSliders}
        variant="round"
        size={20}
        accessibilityLabel={t('negocios.ajustes')}
        onPress={() => pushOnce('/ajustes')}
      />
    </View>
  );

  if (negocios.length === 0) {
    return (
      <Screen
        footer={
          <Button
            label={t('negocios.criarPrimeiro')}
            icon={IconPlus}
            onPress={() => pushOnce('/negocio/novo')}
          />
        }
      >
        {cabecalho}
        <Vazio />
      </Screen>
    );
  }

  return (
    <Screen
      scroll
      gap={12}
      footer={
        <Button
          label={t('negocios.novo')}
          icon={IconPlus}
          elevated
          onPress={() => pushOnce('/negocio/novo')}
        />
      }
    >
      <View style={{ marginBottom: 8 }}>{cabecalho}</View>
      {negocios.map((item) => (
        <CardNegocio key={item.negocio.id} item={item} />
      ))}
    </Screen>
  );
}

function Vazio() {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        paddingHorizontal: 12,
      }}
    >
      <View
        style={{
          width: 180,
          height: 180,
          borderRadius: 90,
          backgroundColor: theme.colors.neutralFill,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            width: 96,
            height: 128,
            backgroundColor: theme.colors.surface,
            borderWidth: 2,
            borderStyle: 'dashed',
            borderColor: theme.colors.textFaint,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Degraus size={56} cor={theme.colors.primaryText} />
        </View>
        <View
          style={{
            position: 'absolute',
            right: 18,
            top: 22,
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: theme.colors.primarySoft,
          }}
        />
      </View>
      <View style={{ gap: 10 }}>
        <Text
          variant="title"
          center
          style={{ fontSize: 26, lineHeight: 30 }}
          accessibilityRole="header"
        >
          {t('negocios.vazioTitulo')}
        </Text>
        <Text variant="body" color="textMuted" center style={{ fontSize: 16, lineHeight: 24 }}>
          {t('negocios.vazioTexto')}
        </Text>
        {isDatabaseAvailable() ? null : (
          <Text variant="caption" color="danger" center>
            {t('negocios.semBanco')}
          </Text>
        )}
      </View>
    </View>
  );
}

function CardNegocio({ item }: { item: NegocioComProgresso }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { unlocked } = useUnlock();
  const { negocio, progresso } = item;

  const linha = t('negocios.linha', {
    segmento: t(ROTULO_SEGMENTO[negocio.segmento]),
    estagio: t(ROTULO_ESTAGIO[negocio.estagio]),
  });
  const proxima = proximaParte(progresso);
  const rodape =
    proxima === null
      ? t('negocios.pronto')
      : t(parteComecada(progresso, proxima) ? 'negocios.proximoTerminar' : 'negocios.proximo', {
          parte: t(ROTULO_PARTE[proxima]),
        });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('negocios.cardRotulo', {
        nome: negocio.nome,
        linha,
        n: progresso.percentual,
      })}
      onPress={() => pushOnce({ pathname: '/negocio/[id]', params: { id: negocio.id } })}
      style={({ pressed }) => ({
        backgroundColor: pressed ? theme.colors.surfaceElevated : theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.card,
        padding: 18,
        gap: 14,
      })}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text variant="heading" numberOfLines={2}>
            {negocio.nome}
          </Text>
          <Text variant="caption" color="textMuted">
            {linha}
          </Text>
        </View>
        <Text variant="heading" color="primaryText" style={{ fontSize: 22, lineHeight: 28 }}>
          {t('negocios.percentual', { n: progresso.percentual })}
        </Text>
      </View>
      <BarraProgresso fracao={progresso.percentual / 100} />
      {unlocked ? (
        <View style={{ gap: 10 }}>
          <Text variant="caption" color="textMuted">
            {rodape}
          </Text>
          <SeloLiberado label={t('negocios.liberado')} />
        </View>
      ) : (
        <Text variant="caption" color="textMuted">
          {rodape}
        </Text>
      )}
    </Pressable>
  );
}
