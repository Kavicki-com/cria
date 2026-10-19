import { router } from 'expo-router';
import { View } from 'react-native';

import { IconButton, IconChevronLeft, IconPencil, Screen, Text } from '@/core/components';
import { useTranslation } from '@/core/i18n/useTranslation';
import { pushOnce, replaceOnce } from '@/core/navigation';

import { ROTULO_ESTAGIO, ROTULO_SEGMENTO, type DadosNegocio } from '../negocios';
import { AnelProgresso } from '../ui';

/** The business hub. Phase 1 shows the header; the parts arrive in phase 2. */
export function HubScreen({ dados }: { dados: DadosNegocio }) {
  const { t } = useTranslation();
  const { negocio, progresso } = dados;

  return (
    <Screen
      scroll
      header={
        <>
          <IconButton
            icon={IconChevronLeft}
            accessibilityLabel={t('common.back')}
            onPress={() => (router.canGoBack() ? router.back() : replaceOnce('/'))}
          />
          <View style={{ flex: 1 }} />
          <IconButton
            icon={IconPencil}
            size={20}
            accessibilityLabel={t('common.edit')}
            onPress={() =>
              pushOnce({ pathname: '/negocio/[id]/editar', params: { id: negocio.id } })
            }
          />
        </>
      }
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text variant="title" accessibilityRole="header">
            {negocio.nome}
          </Text>
          <Text variant="support" color="textMuted">
            {t('negocios.linha', {
              segmento: t(ROTULO_SEGMENTO[negocio.segmento]),
              estagio: t(ROTULO_ESTAGIO[negocio.estagio]),
            })}
          </Text>
        </View>
        <AnelProgresso
          fracao={progresso.percentual / 100}
          size={64}
          espessura={7}
          rotulo={t('negocios.percentual', { n: progresso.percentual })}
        />
      </View>
    </Screen>
  );
}
