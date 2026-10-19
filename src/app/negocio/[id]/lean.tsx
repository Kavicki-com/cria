import { useLocalSearchParams } from 'expo-router';

import { useNegocio } from '@/features/negocios';
import { FormularioGuiado } from '@/features/quadros';

import NotFoundRoute from '../../+not-found';

export default function LeanRoute() {
  const { id, pergunta } = useLocalSearchParams<{ id: string; pergunta?: string }>();
  const dados = useNegocio(id);
  if (!dados) return <NotFoundRoute />;
  return (
    <FormularioGuiado
      negocioId={dados.negocio.id}
      quadro="lean"
      respostas={dados.respostas}
      inicial={pergunta ? Number(pergunta) - 1 : 0}
    />
  );
}
