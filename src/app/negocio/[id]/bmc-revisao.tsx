import { useLocalSearchParams } from 'expo-router';

import { useUnlock } from '@/core/purchases';
import { Bloqueado } from '@/features/desbloqueio';
import { useNegocio } from '@/features/negocios';
import { RevisaoScreen } from '@/features/quadros';

import NotFoundRoute from '../../+not-found';

export default function BmcRevisaoRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dados = useNegocio(id);
  const { unlocked } = useUnlock();
  if (!dados) return <NotFoundRoute />;
  if (!unlocked) return <Bloqueado parte="partes.bmc" />;
  return <RevisaoScreen negocioId={dados.negocio.id} quadro="bmc" respostas={dados.respostas} />;
}
