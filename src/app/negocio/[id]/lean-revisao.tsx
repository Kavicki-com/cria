import { useLocalSearchParams } from 'expo-router';

import { useNegocio } from '@/features/negocios';
import { RevisaoScreen } from '@/features/quadros';

import NotFoundRoute from '../../+not-found';

export default function LeanRevisaoRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dados = useNegocio(id);
  if (!dados) return <NotFoundRoute />;
  return <RevisaoScreen negocioId={dados.negocio.id} quadro="lean" respostas={dados.respostas} />;
}
