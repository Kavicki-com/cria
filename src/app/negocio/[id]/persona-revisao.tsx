import { useLocalSearchParams } from 'expo-router';

import { useUnlock } from '@/core/purchases';
import { Bloqueado } from '@/features/desbloqueio';
import { useNegocio } from '@/features/negocios';
import { RevisaoPersonaScreen } from '@/features/quadros';

import NotFoundRoute from '../../+not-found';

export default function PersonaRevisaoRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dados = useNegocio(id);
  const { unlocked } = useUnlock();
  if (!dados) return <NotFoundRoute />;
  if (!unlocked) return <Bloqueado parte="partes.persona" />;
  return <RevisaoPersonaScreen negocioId={dados.negocio.id} respostas={dados.respostas} />;
}
