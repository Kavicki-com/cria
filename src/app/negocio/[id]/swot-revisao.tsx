import { useLocalSearchParams } from 'expo-router';

import { useUnlock } from '@/core/purchases';
import { Bloqueado } from '@/features/desbloqueio';
import { useNegocio } from '@/features/negocios';
import { RevisaoSwotScreen } from '@/features/swot';

import NotFoundRoute from '../../+not-found';

export default function SwotRevisaoRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dados = useNegocio(id);
  const { unlocked } = useUnlock();
  if (!dados) return <NotFoundRoute />;
  if (!unlocked) return <Bloqueado parte="partes.swot" />;
  return <RevisaoSwotScreen negocioId={dados.negocio.id} swot={dados.swot} />;
}
