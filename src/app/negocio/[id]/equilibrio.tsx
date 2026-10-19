import { useLocalSearchParams } from 'expo-router';

import { EquilibrioScreen } from '@/features/equilibrio';
import { useNegocio } from '@/features/negocios';

import NotFoundRoute from '../../+not-found';

export default function EquilibrioRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dados = useNegocio(id);
  if (!dados) return <NotFoundRoute />;
  return <EquilibrioScreen negocioId={dados.negocio.id} numeros={dados.numeros} />;
}
