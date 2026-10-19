import { useLocalSearchParams } from 'expo-router';

import { useUnlock } from '@/core/purchases';
import { Bloqueado } from '@/features/desbloqueio';
import { useNegocio } from '@/features/negocios';
import { PlanoAcaoScreen } from '@/features/planoAcao';

import NotFoundRoute from '../../+not-found';

export default function PlanoAcaoRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dados = useNegocio(id);
  const { unlocked } = useUnlock();
  if (!dados) return <NotFoundRoute />;
  if (!unlocked) return <Bloqueado parte="partes.plano" />;
  return <PlanoAcaoScreen negocioId={dados.negocio.id} tarefas={dados.tarefas} />;
}
