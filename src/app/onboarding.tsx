import { Onboarding } from '@/core/onboarding';
import { useConfigStore } from '@/core/storage';

/**
 * Onboarding route. The root layout only exposes it while
 * `onboardingCompleted` is false, so finishing it swaps in the tabs.
 */
export default function OnboardingRoute() {
  const completeOnboarding = useConfigStore((state) => state.completeOnboarding);

  return <Onboarding onDone={completeOnboarding} />;
}
