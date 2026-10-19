import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import {
  Button,
  IconButton,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconFileText,
  IconPlus,
  Screen,
  Text,
} from '@/core/components';
import { useTranslation } from '@/core/i18n/useTranslation';
import { pushOnce, replaceOnce } from '@/core/navigation';
import { useTheme } from '@/core/theme';
import { criarTarefa } from '@/data';

import { formatarInteiro } from '../dinheiro';
import { useUnidade } from '../equilibrio/useUnidade';
import type { DadosNegocio } from '../negocios/useDados';
import type { Passo } from './analisar';
import { formatarPct, tarefaDoPasso, textoAchado, textoPasso } from './textos';
import { useAnalise } from './useAnalise';

/** Sua análise (design Analise): the numbers, what needs attention, what is good, next steps. */
export function AnaliseScreen({ dados }: { dados: DadosNegocio }) {
  const theme = useTheme();
  const { t, locale } = useTranslation();
  const analise = useAnalise(dados);
  const unidade = useUnidade(dados.numeros);
  const id = dados.negocio.id;
  const ind = analise.indicadores;

  return (
    <Screen
      scroll
      gap={14}
      header={
        <IconButton
          icon={IconChevronLeft}
          accessibilityLabel={t('common.back')}
          onPress={() =>
            router.canGoBack()
              ? router.back()
              : replaceOnce({ pathname: '/negocio/[id]', params: { id } })
          }
        />
      }
      footer={
        <View style={{ gap: 8 }}>
          <Text variant="caption" color="textMuted" center style={{ fontSize: 13 }}>
            {t('analise.rodape')}
          </Text>
          <Button
            label={t('hub.gerarDocumento')}
            icon={IconFileText}
            onPress={() => pushOnce({ pathname: '/negocio/[id]/documento', params: { id } })}
          />
        </View>
      }
    >
      <View style={{ gap: 4 }}>
        <Text variant="label" color="primaryText" numberOfLines={1}>
          {dados.negocio.nome}
        </Text>
        <Text variant="question" accessibilityRole="header">
          {t('analise.titulo')}
        </Text>
      </View>

      {ind ? (
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Indicador
            destaque
            valor={`${formatarPct(ind.margemPct, locale)}%`}
            rotulo={t('analise.sobra')}
          />
          <Indicador
            valor={t('analise.porDia', { n: formatarInteiro(ind.empateDia) })}
            rotulo={t('analise.paraEmpatar')}
          />
          {ind.sensibilidadeCusto !== null ? (
            <Indicador
              valor={t('analise.sensibilidade', { n: formatarInteiro(ind.sensibilidadeCusto) })}
              rotulo={t('analise.sensibilidadeRotulo', {
                plural: unidade.plural,
                um: `${t('common.moeda')} 1`,
              })}
            />
          ) : null}
        </View>
      ) : (
        <Text variant="support" color="textMuted">
          {t('analise.semNumeros')}
        </Text>
      )}

      <View
        style={{
          backgroundColor: theme.colors.atencaoFundo,
          borderWidth: 1,
          borderColor: theme.colors.atencaoBorda,
          borderRadius: theme.radius.lg,
          paddingVertical: 14,
          paddingHorizontal: 16,
          gap: 10,
        }}
      >
        <Text
          variant="subheading"
          style={{ fontSize: 16, color: theme.colors.onAccentSoft }}
          accessibilityRole="header"
        >
          {t('analise.atencao')}
        </Text>
        {analise.atencao.length === 0 ? (
          <Text variant="caption" style={{ lineHeight: 20 }}>
            {t('analise.nenhumaAtencao')}
          </Text>
        ) : (
          analise.atencao.map((a) => {
            const { titulo, texto } = textoAchado(t, locale, a);
            return <Frase key={a.regra} titulo={titulo} texto={texto} />;
          })
        )}
      </View>

      {analise.bom.length > 0 ? (
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
          <Text
            variant="subheading"
            style={{
              fontSize: 16,
              color:
                theme.scheme === 'dark' ? theme.colors.primaryText : theme.colors.primaryPressed,
            }}
            accessibilityRole="header"
          >
            {t('analise.bom')}
          </Text>
          {analise.bom.map((a) => {
            const { titulo, texto } = textoAchado(t, locale, a);
            return <Frase key={a.regra} titulo={titulo} texto={texto} />;
          })}
        </View>
      ) : null}

      {analise.passos.length > 0 ? (
        <View style={{ gap: 10 }}>
          <Text variant="subheading" style={{ fontSize: 16 }} accessibilityRole="header">
            {t('analise.passos')}
          </Text>
          {analise.passos.map((passo, i) => (
            <LinhaPasso key={passo.regra} dados={dados} passo={passo} numero={i + 1} />
          ))}
        </View>
      ) : null}

      <Text variant="caption" color="textMuted" style={{ fontSize: 12, lineHeight: 17 }}>
        {t('analise.aviso')}
      </Text>
    </Screen>
  );
}

function Indicador({
  valor,
  rotulo,
  destaque = false,
}: {
  valor: string;
  rotulo: string;
  destaque?: boolean;
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: destaque ? theme.colors.primarySoft : theme.colors.surface,
        borderWidth: destaque ? 0 : 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.input,
        padding: 12,
        gap: 2,
      }}
    >
      <Text
        variant="heading"
        style={{
          fontSize: 20,
          lineHeight: 26,
          color: destaque ? theme.colors.primaryText : theme.colors.text,
        }}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {valor}
      </Text>
      <Text
        style={{
          fontSize: 12,
          lineHeight: 16,
          color: destaque ? theme.colors.textBody : theme.colors.textMuted,
        }}
      >
        {rotulo}
      </Text>
    </View>
  );
}

function Frase({ titulo, texto }: { titulo: string; texto: string }) {
  const theme = useTheme();
  return (
    <Text variant="caption" style={{ lineHeight: 20, color: theme.colors.text }}>
      <Text variant="caption" style={{ fontFamily: theme.fonts.bold, color: theme.colors.text }}>
        {`${titulo}. `}
      </Text>
      {texto}
    </Text>
  );
}

/** A next step: opens the question it points to, or adds its task to the plan (once). */
function LinhaPasso({
  dados,
  passo,
  numero,
}: {
  dados: DadosNegocio;
  passo: Passo;
  numero: number;
}) {
  const theme = useTheme();
  const { t, locale } = useTranslation();
  const id = dados.negocio.id;
  const tarefa = passo.destino.tipo === 'tarefa' ? tarefaDoPasso(t, passo) : null;
  const jaNoPlano = tarefa !== null && dados.tarefas.some((x) => x.origemRegra === passo.regra);

  function abrir() {
    const d = passo.destino;
    switch (d.tipo) {
      case 'lean':
        pushOnce({ pathname: '/negocio/[id]/lean', params: { id, pergunta: String(d.pergunta) } });
        return;
      case 'persona':
        pushOnce({
          pathname: '/negocio/[id]/persona',
          params: { id, pergunta: String(d.pergunta) },
        });
        return;
      case 'equilibrio':
        pushOnce({ pathname: '/negocio/[id]/equilibrio', params: { id } });
        return;
      case 'swot':
        pushOnce({ pathname: '/negocio/[id]/swot', params: { id } });
        return;
      case 'plano':
        pushOnce({ pathname: '/negocio/[id]/plano-acao', params: { id } });
        return;
      case 'tarefa':
        if (tarefa && !jaNoPlano) criarTarefa(id, { nome: tarefa, origemRegra: passo.regra });
        return;
    }
  }

  const rotulo = jaNoPlano
    ? t('analise.noPlano', { tarefa: tarefa ?? '' })
    : textoPasso(t, locale, passo);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: jaNoPlano }}
      disabled={jaNoPlano}
      onPress={abrir}
      style={({ pressed }) => ({
        minHeight: 44,
        backgroundColor: pressed ? theme.colors.surfaceElevated : theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.input,
        paddingVertical: 10,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      })}
    >
      <View
        style={{
          width: 26,
          height: 26,
          borderRadius: 13,
          backgroundColor: jaNoPlano ? theme.colors.success : theme.colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {jaNoPlano ? (
          <IconCheck size={14} strokeWidth={3} color={theme.colors.onPrimary} />
        ) : (
          <Text
            style={{ fontSize: 13, fontFamily: theme.fonts.bold, color: theme.colors.onPrimary }}
          >
            {numero}
          </Text>
        )}
      </View>
      <Text
        variant="caption"
        style={{
          flex: 1,
          lineHeight: 20,
          color: jaNoPlano ? theme.colors.textMuted : theme.colors.text,
        }}
      >
        {rotulo}
      </Text>
      {jaNoPlano ? null : passo.destino.tipo === 'tarefa' ? (
        <IconPlus size={18} strokeWidth={2.2} color={theme.colors.primaryText} />
      ) : (
        <IconChevronRight size={18} strokeWidth={2} color={theme.colors.textFaint} />
      )}
    </Pressable>
  );
}
