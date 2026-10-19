import { useLocalSearchParams } from 'expo-router';

import { useUnlock } from '@/core/purchases';
import { Bloqueado } from '@/features/desbloqueio';
import { useNegocio } from '@/features/negocios';
import { FormularioGuiado } from '@/features/quadros';

import NotFoundRoute from '../../+not-found';

export default function PersonaRoute() {
  const { id, pergunta } = useLocalSearchParams<{ id: string; pergunta?: string }>();
  const dados = useNegocio(id);
  const { unlocked } = useUnlock();
  if (!dados) return <NotFoundRoute />;
  if (!unlocked) return <Bloqueado parte="partes.persona" />;
  return (
    <FormularioGuiado
      negocioId={dados.negocio.id}
      quadro="persona"
      respostas={dados.respostas}
      inicial={pergunta ? Number(pergunta) - 1 : 0}
    />
  );
}
