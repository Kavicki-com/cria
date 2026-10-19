import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, Switch, TextInput, View } from 'react-native';

import {
  Button,
  Dialog,
  IconBell,
  IconButton,
  IconCalendar,
  IconCheck,
  IconChevronLeft,
  IconPlus,
  Screen,
  Text,
  TextField,
} from '@/core/components';
import { useTranslation } from '@/core/i18n/useTranslation';
import { ensureNotificationsReady, isNotificationsAvailable } from '@/core/notifications';
import { replaceOnce } from '@/core/navigation';
import { useTheme } from '@/core/theme';
import { atualizarTarefa, criarTarefa, removerTarefa, type Tarefa } from '@/data';

import { diaDoIso, formatarDiaCurto, isoDoDia } from './datas';
import { escolherDiaAndroid, isSeletorDataDisponivel, SeletorDiaIOS } from './seletorData';

/**
 * Plano de ação (design Plano-acao): tasks with an optional day and a local
 * reminder, pending first, done below. Tapping a task opens its sheet (name,
 * day, reminder, delete); the bell toggles the reminder.
 */
export function PlanoAcaoScreen({ negocioId, tarefas }: { negocioId: string; tarefas: Tarefa[] }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [nova, setNova] = useState('');
  const [editando, setEditando] = useState<Tarefa | null>(null);
  const [semPermissao, setSemPermissao] = useState(false);
  const meses = t('planoAcao.meses').split(',');

  const pendentes = tarefas.filter((x) => !x.feita);
  const feitas = tarefas.filter((x) => x.feita);
  const proxima = pendentes
    .map((x) => x.data)
    .filter((d): d is string => d !== null)
    .sort()[0];

  const resumo =
    tarefas.length === 0
      ? t('planoAcao.resumoVazio')
      : pendentes.length === 0
        ? t('planoAcao.resumoEmDia', { feitas: feitas.length, total: tarefas.length })
        : proxima
          ? t('planoAcao.resumoProxima', {
              feitas: feitas.length,
              total: tarefas.length,
              data: formatarDiaCurto(proxima, meses) ?? '',
            })
          : t('planoAcao.resumo', { feitas: feitas.length, total: tarefas.length });

  function adicionar() {
    if (!nova.trim()) return;
    criarTarefa(negocioId, { nome: nova });
    setNova('');
  }

  async function alternarLembrete(tarefa: Tarefa) {
    if (tarefa.lembrete) {
      atualizarTarefa(tarefa.id, { lembrete: false });
      return;
    }
    if (!tarefa.data) {
      // A reminder needs a day: open the sheet to pick one.
      setEditando({ ...tarefa, lembrete: true });
      return;
    }
    if (await ensureNotificationsReady()) atualizarTarefa(tarefa.id, { lembrete: true });
    else setSemPermissao(true);
  }

  return (
    <Screen
      scroll
      gap={16}
      header={
        <IconButton
          icon={IconChevronLeft}
          accessibilityLabel={t('common.back')}
          onPress={() =>
            router.canGoBack()
              ? router.back()
              : replaceOnce({ pathname: '/negocio/[id]', params: { id: negocioId } })
          }
        />
      }
    >
      <View style={{ gap: 6 }}>
        <Text variant="question" accessibilityRole="header">
          {t('partes.plano')}
        </Text>
        <Text variant="support" color="textMuted">
          {resumo}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TextInput
          value={nova}
          onChangeText={setNova}
          onSubmitEditing={adicionar}
          submitBehavior="submit"
          returnKeyType="done"
          accessibilityLabel={t('planoAcao.novaTarefa')}
          placeholder={t('planoAcao.placeholder')}
          placeholderTextColor={theme.colors.textFaint}
          selectionColor={theme.colors.primary}
          maxLength={120}
          style={{
            flex: 1,
            minHeight: 52,
            borderWidth: 1,
            borderColor: theme.colors.borderInput,
            borderRadius: theme.radius.input,
            backgroundColor: theme.colors.surface,
            paddingHorizontal: 16,
            fontFamily: theme.fonts.regular,
            fontSize: 16,
            color: theme.colors.text,
          }}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('planoAcao.adicionar')}
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

      {semPermissao ? (
        <Text variant="caption" color="danger">
          {t('planoAcao.semPermissao')}
        </Text>
      ) : null}

      <View style={{ gap: 8 }}>
        {pendentes.map((tarefa) => (
          <LinhaTarefa
            key={tarefa.id}
            tarefa={tarefa}
            meses={meses}
            onAbrir={() => setEditando(tarefa)}
            onSino={() => void alternarLembrete(tarefa)}
          />
        ))}
      </View>

      {feitas.length > 0 ? (
        <View style={{ gap: 8 }}>
          <Text variant="label" color="textMuted" accessibilityRole="header">
            {t('planoAcao.feitas')}
          </Text>
          {feitas.map((tarefa) => (
            <LinhaTarefa
              key={tarefa.id}
              tarefa={tarefa}
              meses={meses}
              onAbrir={() => setEditando(tarefa)}
            />
          ))}
        </View>
      ) : null}

      {editando ? (
        <FolhaTarefa
          tarefa={editando}
          onFechar={() => setEditando(null)}
          onSemPermissao={() => setSemPermissao(true)}
        />
      ) : null}
    </Screen>
  );
}

function LinhaTarefa({
  tarefa,
  meses,
  onAbrir,
  onSino,
}: {
  tarefa: Tarefa;
  meses: string[];
  onAbrir: () => void;
  onSino?: () => void;
}) {
  const theme = useTheme();
  const { t } = useTranslation();
  const data = formatarDiaCurto(tarefa.data, meses) ?? t('planoAcao.semData');

  return (
    <View
      style={{
        backgroundColor: tarefa.feita ? theme.colors.neutralFill : theme.colors.surface,
        borderWidth: tarefa.feita ? 0 : 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.lg,
        paddingVertical: 6,
        paddingLeft: 4,
        paddingRight: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
      }}
    >
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: tarefa.feita }}
        accessibilityLabel={
          tarefa.feita
            ? t('planoAcao.desmarcar', { nome: tarefa.nome })
            : t('planoAcao.marcar', { nome: tarefa.nome })
        }
        onPress={() => atualizarTarefa(tarefa.id, { feita: !tarefa.feita })}
        style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
      >
        {tarefa.feita ? (
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 8,
              backgroundColor: theme.colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconCheck size={14} strokeWidth={3} color={theme.colors.onPrimary} />
          </View>
        ) : (
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 8,
              borderWidth: 2,
              borderColor: theme.colors.textFaint,
            }}
          />
        )}
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityHint={t('planoAcao.editarDica')}
        onPress={onAbrir}
        style={{ flex: 1, paddingVertical: 6, gap: 3 }}
      >
        <Text
          variant="bodyStrong"
          style={{
            fontSize: 16,
            lineHeight: 22,
            color: tarefa.feita ? theme.colors.textMuted : theme.colors.text,
            textDecorationLine: tarefa.feita ? 'line-through' : 'none',
            fontFamily: tarefa.feita ? theme.fonts.regular : theme.fonts.bold,
          }}
        >
          {tarefa.nome}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          {tarefa.feita ? null : (
            <IconCalendar size={13} strokeWidth={2} color={theme.colors.textMuted} />
          )}
          <Text variant="caption" color="textMuted" style={{ fontSize: 13 }}>
            {data}
          </Text>
        </View>
      </Pressable>
      {onSino && isNotificationsAvailable() ? (
        <Pressable
          accessibilityRole="switch"
          accessibilityState={{ checked: tarefa.lembrete }}
          accessibilityLabel={
            tarefa.lembrete ? t('planoAcao.lembreteLigado') : t('planoAcao.ligarLembrete')
          }
          onPress={onSino}
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: tarefa.lembrete ? theme.colors.primarySoft : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconBell
            size={20}
            strokeWidth={2}
            color={tarefa.lembrete ? theme.colors.primaryText : theme.colors.textFaint}
            fill={tarefa.lembrete ? theme.colors.primaryText : 'none'}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

/** The task's sheet: name, day, reminder and delete. Saves on "Salvar". */
function FolhaTarefa({
  tarefa,
  onFechar,
  onSemPermissao,
}: {
  tarefa: Tarefa;
  onFechar: () => void;
  onSemPermissao: () => void;
}) {
  const theme = useTheme();
  const { t, locale } = useTranslation();
  const [nome, setNome] = useState(tarefa.nome);
  const [data, setData] = useState<string | null>(tarefa.data);
  const [lembrete, setLembrete] = useState(tarefa.lembrete);
  const [visivel, setVisivel] = useState(true);
  const [mostrarCalendario, setMostrarCalendario] = useState(
    Platform.OS === 'ios' && tarefa.lembrete && !tarefa.data,
  );
  const meses = t('planoAcao.meses').split(',');
  const podeEscolher = isSeletorDataDisponivel();
  const amanha = new Date();
  amanha.setDate(amanha.getDate() + 1);

  async function escolherDia() {
    if (Platform.OS === 'ios') {
      if (!data) setData(isoDoDia(amanha));
      setMostrarCalendario(true);
      return;
    }
    const dia = await escolherDiaAndroid(diaDoIso(data) ?? amanha);
    if (dia) setData(isoDoDia(dia));
  }

  async function salvar() {
    let comLembrete = lembrete && data !== null;
    if (comLembrete && !tarefa.lembrete && !(await ensureNotificationsReady())) {
      comLembrete = false;
      onSemPermissao();
    }
    atualizarTarefa(tarefa.id, { nome, data, lembrete: comLembrete });
    setVisivel(false);
  }

  return (
    <Dialog sheet visible={visivel} onDismiss={() => setVisivel(false)} onFechado={onFechar}>
      <Text variant="heading" accessibilityRole="header">
        {t('planoAcao.editarTitulo')}
      </Text>
      <TextField label={t('planoAcao.nome')} value={nome} onChangeText={setNome} maxLength={120} />

      <View style={{ gap: 8 }}>
        <Text variant="support" style={{ fontFamily: theme.fonts.bold }}>
          {t('planoAcao.dia')}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Pressable
            accessibilityRole="button"
            disabled={!podeEscolher}
            onPress={() => void escolherDia()}
            style={{
              flex: 1,
              minHeight: 52,
              borderWidth: 1,
              borderColor: theme.colors.borderInput,
              borderRadius: theme.radius.input,
              backgroundColor: theme.colors.surface,
              paddingHorizontal: 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              opacity: podeEscolher ? 1 : 0.5,
            }}
          >
            <IconCalendar size={18} strokeWidth={2} color={theme.colors.textMuted} />
            <Text style={{ fontSize: 16 }}>
              {formatarDiaCurto(data, meses) ?? t('planoAcao.escolherDia')}
            </Text>
          </Pressable>
          {data ? (
            <Button
              variant="link"
              label={t('planoAcao.tirarDia')}
              onPress={() => {
                setData(null);
                setLembrete(false);
                setMostrarCalendario(false);
              }}
            />
          ) : null}
        </View>
        {Platform.OS === 'ios' && mostrarCalendario ? (
          <SeletorDiaIOS
            valor={diaDoIso(data) ?? amanha}
            onChange={(dia) => setData(isoDoDia(dia))}
            escuro={theme.scheme === 'dark'}
            locale={locale}
          />
        ) : null}
      </View>

      {isNotificationsAvailable() ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={{ fontSize: 16 }}>{t('planoAcao.lembrete')}</Text>
            <Text variant="caption" color="textMuted" style={{ fontSize: 13 }}>
              {data ? t('planoAcao.lembreteDica') : t('planoAcao.lembretePrecisaDia')}
            </Text>
          </View>
          <Switch
            accessibilityLabel={t('planoAcao.lembrete')}
            value={lembrete && data !== null}
            disabled={data === null}
            onValueChange={setLembrete}
            trackColor={{ true: theme.colors.primary, false: theme.colors.borderInput }}
          />
        </View>
      ) : null}

      <View style={{ gap: 8 }}>
        <Button label={t('common.save')} onPress={() => void salvar()} disabled={!nome.trim()} />
        <Button
          variant="link"
          label={t('planoAcao.excluir')}
          onPress={() => {
            removerTarefa(tarefa.id);
            setVisivel(false);
          }}
          style={{ alignSelf: 'center' }}
        />
      </View>
    </Dialog>
  );
}
