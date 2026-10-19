import { useLocalSearchParams } from 'expo-router';

import { HubScreen } from '@/features/hub';

import NotFoundRoute from '../../+not-found';
import { useNegocio } from '@/features/negocios';

export default function HubRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dados = useNegocio(id);
  if (!dados) return <NotFoundRoute />;
  return <HubScreen dados={dados} />;
}
