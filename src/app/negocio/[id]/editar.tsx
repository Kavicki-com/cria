import { useLocalSearchParams } from 'expo-router';

import { NovoNegocioScreen, useNegocio } from '@/features/negocios';

import NotFoundRoute from '../../+not-found';

export default function EditarNegocioRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dados = useNegocio(id);
  if (!dados) return <NotFoundRoute />;
  return <NovoNegocioScreen negocio={dados.negocio} />;
}
