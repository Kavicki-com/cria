import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import {
  Button,
  IconButton,
  IconCheck,
  IconChevronLeft,
  IconTriangleAlert,
  Screen,
  Text,
  TextField,
} from '@/core/components';
import { useTranslation } from '@/core/i18n/useTranslation';
import { replaceOnce } from '@/core/navigation';
import { useTheme } from '@/core/theme';
import { salvarNumeros, type Numeros } from '@/data';

import { formatarEntrada, formatarInteiro, formatarMoedaCurta, parseDinheiro } from '../dinheiro';
import { avaliarNumeros, calcularIndicadores } from './calculo';
import { pluralizar } from './unidade';
import { useUnidade } from './useUnidade';

export type EquilibrioProps = {
  negocioId: string;
  numeros: Numeros;
};

/**
 * Ponto de equilíbrio (design Ponto-equilibrio): three numbers in, the green
 * card out. Every field saves when it loses focus, like the guided form; the
 * card follows what is typed, before saving.
 */
export function EquilibrioScreen({ negocioId, numeros }: EquilibrioProps) {
  const theme = useTheme();
  const { t, locale } = useTranslation();
  const ptBr = locale === 'pt-BR';

  const [unidade, setUnidade] = useState(numeros.unidadeSingular ?? '');
  const [plural, setPlural] = useState(numeros.unidadePlural ?? '');
  const [editandoPlural, setEditandoPlural] = useState(Boolean(numeros.unidadePlural));
  const [fixos, setFixos] = useState(formatarEntrada(numeros.fixos));
  const [custo, setCusto] = useState(formatarEntrada(numeros.custoUnitario));
  const [preco, setPreco] = useState(formatarEntrada(numeros.preco));
  const [maior, setMaior] = useState(numeros.maiorCusto ?? '');

  const atuais: Numeros = {
    ...numeros,
    unidadeSingular: unidade,
    unidadePlural: plural.trim() ? plural : null,
    fixos: parseDinheiro(fixos),
    custoUnitario: parseDinheiro(custo),
    preco: parseDinheiro(preco),
    maiorCusto: maior,
  };
  const u = useUnidade(atuais);
  const estado = avaliarNumeros(atuais);
  const moeda = t('common.moeda');

  function salvar(patch: Partial<Numeros>) {
    salvarNumeros(negocioId, patch);
  }

  function voltar() {
    salvar({
      unidadeSingular: atuais.unidadeSingular,
      unidadePlural: atuais.unidadePlural,
      fixos: atuais.fixos,
      custoUnitario: atuais.custoUnitario,
      preco: atuais.preco,
      maiorCusto: atuais.maiorCusto,
    });
    if (router.canGoBack()) router.back();
    else replaceOnce({ pathname: '/negocio/[id]', params: { id: negocioId } });
  }

  /** Re-shows a money field in the canonical form once it is saved. */
  function campoDinheiro(texto: string, setTexto: (v: string) => void, chave: keyof Numeros) {
    return {
      value: texto,
      onChangeText: setTexto,
      keyboardType: 'decimal-pad' as const,
      prefix: moeda,
      tabular: true,
      onBlur: () => {
        const valor = parseDinheiro(texto);
        setTexto(formatarEntrada(valor));
        salvar({ [chave]: valor });
      },
    };
  }

  const pluralGerado = ptBr && unidade.trim() ? pluralizar(unidade) : u.plural;

  return (
    <Screen
      scroll
      gap={16}
      header={
        <IconButton icon={IconChevronLeft} accessibilityLabel={t('common.back')} onPress={voltar} />
      }
      footer={<Button variant="secondary" label={t('equilibrio.salvarVoltar')} onPress={voltar} />}
    >
      <View style={{ gap: 6 }}>
        <Text variant="question" accessibilityRole="header">
          {t('partes.equilibrio')}
        </Text>
        <Text variant="support" color="textMuted">
          {t('equilibrio.subtitulo')}
        </Text>
      </View>

      <View style={{ gap: 14 }}>
        <View style={{ gap: 6 }}>
          <TextField
            label={t('equilibrio.oQueVende')}
            value={unidade}
            onChangeText={setUnidade}
            onBlur={() => salvar({ unidadeSingular: unidade })}
            placeholder={t('equilibrio.oQueVendePlaceholder')}
            autoCapitalize="none"
            maxLength={40}
          />
          {ptBr && !editandoPlural ? (
            <Pressable
              accessibilityRole="button"
              accessibilityHint={t('equilibrio.mudarPluralDica')}
              onPress={() => {
                setPlural(pluralGerado);
                setEditandoPlural(true);
              }}
              hitSlop={8}
            >
              <Text variant="caption" color="textMuted" style={{ fontSize: 13 }}>
                {t('equilibrio.pluralFica')}{' '}
                <Text variant="caption" style={{ fontSize: 13, fontFamily: theme.fonts.bold }}>
                  {u.plural}
                </Text>
                {'. '}
                <Text
                  variant="caption"
                  color="primaryText"
                  style={{ fontSize: 13, textDecorationLine: 'underline' }}
                >
                  {t('equilibrio.mudarPlural')}
                </Text>
              </Text>
            </Pressable>
          ) : (
            <TextField
              label={t('equilibrio.plural')}
              value={plural}
              onChangeText={setPlural}
              onBlur={() => salvar({ unidadePlural: plural.trim() ? plural : null })}
              placeholder={pluralGerado}
              autoCapitalize="none"
              maxLength={40}
            />
          )}
        </View>

        <TextField
          label={t('equilibrio.fixos')}
          hint={t('equilibrio.fixosDica')}
          {...campoDinheiro(fixos, setFixos, 'fixos')}
        />

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <TextField
              label={t('equilibrio.custoDeCada', { singular: u.singular })}
              {...campoDinheiro(custo, setCusto, 'custoUnitario')}
            />
          </View>
          <View style={{ flex: 1 }}>
            <TextField label={t('equilibrio.preco')} {...campoDinheiro(preco, setPreco, 'preco')} />
          </View>
        </View>

        <TextField
          label={t('equilibrio.maiorCusto')}
          hint={t('equilibrio.maiorCustoDica', { singular: u.singular })}
          value={maior}
          onChangeText={setMaior}
          onBlur={() => salvar({ maiorCusto: maior })}
          placeholder={t('equilibrio.maiorCustoPlaceholder')}
          autoCapitalize="none"
          maxLength={40}
        />
      </View>

      {estado.tipo === 'ok' ? (
        <CardEquilibrio
          numeros={estado.numeros}
          singular={u.singular}
          plural={u.plural}
          maiorCusto={maior.trim()}
          moeda={moeda}
        />
      ) : estado.tipo === 'nao-fecha' ? (
        <View
          accessibilityLiveRegion="polite"
          style={{
            backgroundColor: theme.colors.dangerSoft,
            borderRadius: theme.radius.card,
            padding: 20,
            gap: 6,
          }}
        >
          <Text variant="heading" style={{ color: theme.colors.onDangerSoft }}>
            {t('equilibrio.naoFechaTitulo')}
          </Text>
          <Text variant="support" style={{ color: theme.colors.onDangerSoft }}>
            {t('equilibrio.naoFechaTexto', { singular: u.singular })}
          </Text>
        </View>
      ) : null}
    </Screen>
  );
}

function CardEquilibrio({
  numeros,
  singular,
  plural,
  maiorCusto,
  moeda,
}: {
  numeros: { fixos: number; custoUnitario: number; preco: number; diasPorMes: number };
  singular: string;
  plural: string;
  maiorCusto: string;
  moeda: string;
}) {
  const theme = useTheme();
  const { t } = useTranslation();
  const i = calcularIndicadores(numeros);
  const custoPct = Math.round((numeros.custoUnitario / numeros.preco) * 100);

  return (
    <View
      accessibilityLiveRegion="polite"
      style={{
        backgroundColor: theme.colors.equilibrioFundo,
        borderWidth: 1,
        borderColor: theme.colors.equilibrioBorda,
        borderRadius: theme.radius.card,
        padding: 18,
        gap: 14,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: theme.colors.success,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconCheck size={14} strokeWidth={3} color={theme.colors.equilibrioFundo} />
        </View>
        <Text variant="captionStrong" style={{ fontSize: 14, color: theme.colors.onSuccessSoft }}>
          {t('equilibrio.empataVendendo')}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
        <Text
          variant="display"
          style={{ color: theme.colors.onSuccessSoft, lineHeight: 38, letterSpacing: 0 }}
        >
          {formatarInteiro(i.empateMes)}
        </Text>
        <Text style={{ fontSize: 16, color: theme.colors.equilibrioTexto }}>
          {t('equilibrio.porMes', { plural })}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Tile
          rotulo={t('equilibrio.porDia')}
          valor={t('equilibrio.porDiaValor', { n: formatarInteiro(i.empateDia), plural })}
        />
        <Tile
          rotulo={t('equilibrio.faturamento')}
          valor={formatarMoedaCurta(i.faturamentoEmpate, moeda)}
        />
      </View>

      <View style={{ gap: 8 }}>
        <Text variant="caption" style={{ fontSize: 13, color: theme.colors.equilibrioTexto }}>
          {t('equilibrio.deCada', { singular, preco: formatarMoedaCurta(numeros.preco, moeda) })}
        </Text>
        <View
          accessible
          accessibilityRole="image"
          accessibilityLabel={t('equilibrio.barraRotulo', { pct: custoPct, singular })}
          style={{
            flexDirection: 'row',
            height: 10,
            borderRadius: 5,
            overflow: 'hidden',
            backgroundColor: theme.colors.success,
          }}
        >
          <View style={{ width: `${custoPct}%`, backgroundColor: theme.colors.equilibrioCusto }} />
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          <Legenda
            cor={theme.colors.equilibrioCusto}
            texto={t('equilibrio.deCusto', {
              valor: formatarMoedaCurta(numeros.custoUnitario, moeda),
            })}
          />
          <Legenda
            cor={theme.colors.success}
            texto={t('equilibrio.pagaContas', { valor: formatarMoedaCurta(i.margemUnit, moeda) })}
          />
        </View>
      </View>

      {maiorCusto && i.sensibilidadeCusto !== null && i.sensibilidadeCusto > 0 ? (
        <View
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: 12,
            padding: 12,
            flexDirection: 'row',
            gap: 10,
            alignItems: 'flex-start',
          }}
        >
          <IconTriangleAlert size={18} strokeWidth={2} color={theme.colors.warning} />
          <Text variant="caption" style={{ flex: 1, lineHeight: 20, color: theme.colors.text }}>
            {t('equilibrio.maiorCustoAntes')}
            <Text
              variant="caption"
              style={{ fontFamily: theme.fonts.bold, color: theme.colors.text }}
            >
              {maiorCusto}
            </Text>
            {t('equilibrio.maiorCustoMeio', { singular, um: formatarMoedaCurta(100, moeda) })}
            <Text
              variant="caption"
              style={{ fontFamily: theme.fonts.bold, color: theme.colors.text }}
            >
              {t('equilibrio.maiorCustoN', { n: formatarInteiro(i.sensibilidadeCusto), plural })}
            </Text>
            {t('equilibrio.maiorCustoDepois')}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function Tile({ rotulo, valor }: { rotulo: string; valor: string }) {
  const theme = useTheme();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 12,
        gap: 2,
      }}
    >
      <Text style={{ fontSize: 12, lineHeight: 16, color: theme.colors.equilibrioRotulo }}>
        {rotulo}
      </Text>
      <Text variant="bodyStrong" style={{ fontSize: 16, lineHeight: 22 }}>
        {valor}
      </Text>
    </View>
  );
}

function Legenda({ cor, texto }: { cor: string; texto: string }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: cor }} />
      <Text variant="caption" style={{ fontSize: 13, color: theme.colors.equilibrioTexto }}>
        {texto}
      </Text>
    </View>
  );
}
