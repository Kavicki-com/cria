import { useLocalSearchParams } from 'expo-router';

import { useUnlock } from '@/core/purchases';
import { Bloqueado } from '@/features/desbloqueio';
import { useNegocio } from '@/features/negocios';
import { SwotScreen } from '@/features/swot';

import NotFoundRoute from '../../+not-found';

export default function SwotRoute() {
  const { id, parte } = useLocalSearchParams<{ id: string; parte?: string }>();
  const dados = useNegocio(id);
  const { unlocked } = useUnlock();
  if (!dados) return <NotFoundRoute />;
  if (!unlocked) return <Bloqueado parte="partes.swot" />;
  return (
    <SwotScreen
      negocioId={dados.negocio.id}
      swot={dados.swot}
      inicial={parte ? Number(parte) - 1 : 0}
    />
  );
}
