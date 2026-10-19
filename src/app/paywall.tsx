import { router } from 'expo-router';

import { Paywall } from '@/core/paywall';

/** Generic paywall, presented as a modal from anywhere via `openPaywall()`. */
export default function PaywallRoute() {
  function close() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }

  return <Paywall onUnlocked={close} onDismiss={close} />;
}
