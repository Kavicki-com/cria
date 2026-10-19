import { useLocalSearchParams } from 'expo-router';

import { useUnlock } from '@/core/purchases';
import { Bloqueado } from '@/features/desbloqueio';
import { DocumentoScreen } from '@/features/documento';
import { useNegocio } from '@/features/negocios';

import NotFoundRoute from '../../+not-found';

export default function DocumentoRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dados = useNegocio(id);
  const { unlocked } = useUnlock();
  if (!dados) return <NotFoundRoute />;
  if (!unlocked) return <Bloqueado parte="hub.gerarDocumento" />;
  return <DocumentoScreen dados={dados} />;
}
