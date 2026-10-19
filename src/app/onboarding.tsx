import { BoasVindasScreen } from '@/features/boasVindas';
import { pedirNovoNegocioAoEntrar } from '@/features/negocios';
import { useConfigStore } from '@/core/storage';

/**
 * Onboarding route. The root layout only exposes it while
 * `onboardingCompleted` is false, so finishing it swaps in Meus negócios.
 */
export default function OnboardingRoute() {
  const completeOnboarding = useConfigStore((state) => state.completeOnboarding);

  return (
    <BoasVindasScreen
      onConcluir={(criar) => {
        if (criar) pedirNovoNegocioAoEntrar();
        completeOnboarding();
      }}
    />
  );
}
