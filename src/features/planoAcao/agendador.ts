import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { t } from '@/core/i18n';
import { pushOnce } from '@/core/navigation';
import {
  addReminderTapListener,
  cancelAllReminders,
  consumeLaunchReminderTap,
  getNotificationPermission,
  isNotificationsAvailable,
  scheduleAt,
  type ReminderTapData,
} from '@/core/notifications';
import { useUnlock } from '@/core/purchases';
import { getNegocio, listTarefasComLembrete } from '@/data';

import { useVersaoDados } from '../negocios/useDados';
import { momentoDoLembrete } from './datas';

/**
 * Local reminders for the action plan (modelled on Pendurô's
 * `lembretes/agendador.ts`).
 *
 * The whole plan is re-scheduled from the database on every write: cancel
 * everything, then schedule each pending task with a reminder whose day is
 * still ahead. Recomputing beats keeping notification ids in sync with edits,
 * deletions and "done" toggles — one rule, no drift.
 *
 * It never asks for permission (the bell does, where the person expects it);
 * without permission, or without the unlock, it only cancels.
 */
let fila: Promise<void> = Promise.resolve();

export function reagendarLembretes(desbloqueado: boolean): Promise<void> {
  fila = fila
    .then(async () => {
      if (!isNotificationsAvailable()) return;
      await cancelAllReminders();
      if (!desbloqueado || (await getNotificationPermission()) !== 'granted') return;

      const agora = Date.now();
      for (const tarefa of listTarefasComLembrete()) {
        const quando = momentoDoLembrete(tarefa.data);
        if (quando === null || quando <= agora) continue;
        const negocio = getNegocio(tarefa.negocioId);
        if (!negocio) continue;
        await scheduleAt(
          {
            title: t('planoAcao.lembreteTitulo', { negocio: negocio.nome }),
            body: tarefa.nome,
            data: { negocioId: negocio.id },
          },
          new Date(quando),
        );
      }
    })
    .catch(() => {
      // A failed round leaves the previous plan; the next change retries.
    });
  return fila;
}

/** Keeps the scheduled reminders in step with the tasks. Mount once, in the root layout. */
export function useAgendadorLembretes(): void {
  const versao = useVersaoDados();
  const { unlocked } = useUnlock();
  const [primeiroPlano, setPrimeiroPlano] = useState(0);

  // Back to the foreground: the permission may have changed in the OS settings.
  useEffect(() => {
    const assinatura = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') setPrimeiroPlano((n) => n + 1);
    });
    return () => assinatura.remove();
  }, []);

  useEffect(() => {
    // Debounced: a burst of writes (typing a task, the dev sample) plans once.
    const timer = setTimeout(() => void reagendarLembretes(unlocked), 800);
    return () => clearTimeout(timer);
  }, [versao, unlocked, primeiroPlano]);
}

function abrir(data: ReminderTapData): void {
  const id = data.negocioId;
  if (typeof id !== 'string' || !getNegocio(id)) return;
  pushOnce({ pathname: '/negocio/[id]/plano-acao', params: { id } });
}

/** Opens the action plan a tapped reminder belongs to, warm or from a cold start. */
export function useAbrirLembreteTocado(): void {
  useEffect(() => {
    void consumeLaunchReminderTap().then((data) => {
      if (data) abrir(data);
    });
    return addReminderTapListener(abrir);
  }, []);
}
