import { useLocalSearchParams } from 'expo-router';

import { useUnlock } from '@/core/purchases';
import { AnaliseScreen } from '@/features/analise';
import { Bloqueado } from '@/features/desbloqueio';
import { useNegocio } from '@/features/negocios';

import NotFoundRoute from '../../+not-found';

export default function AnaliseRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dados = useNegocio(id);
  const { unlocked } = useUnlock();
  if (!dados) return <NotFoundRoute />;
  if (!unlocked) return <Bloqueado parte="analise.titulo" />;
  return <AnaliseScreen dados={dados} />;
}
