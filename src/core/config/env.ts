import { Platform } from 'react-native';

/**
 * Typed access to the `EXPO_PUBLIC_*` env vars declared in `.env.example`.
 *
 * `process.env.EXPO_PUBLIC_*` is inlined at bundle time by Metro, so each var
 * must be read as a static property access — do not build the key dynamically.
 */

type AppEnv = 'development' | 'preview' | 'production';

function str(value: string | undefined, fallback = ''): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

const APP_ENV = str(process.env.EXPO_PUBLIC_APP_ENV, 'development') as AppEnv;

export const env = {
  appEnv: APP_ENV,
  isProduction: APP_ENV === 'production',

  revenueCat: {
    iosApiKey: str(process.env.EXPO_PUBLIC_RC_IOS_API_KEY),
    androidApiKey: str(process.env.EXPO_PUBLIC_RC_ANDROID_API_KEY),
    entitlementId: str(process.env.EXPO_PUBLIC_RC_ENTITLEMENT_ID, 'pro'),
    /** Empty means "use the current offering configured in RevenueCat". */
    offeringId: str(process.env.EXPO_PUBLIC_RC_OFFERING_ID),
    productId: str(process.env.EXPO_PUBLIC_RC_PRODUCT_ID),
  },

  store: {
    iosAppStoreId: str(process.env.EXPO_PUBLIC_IOS_APP_STORE_ID),
    androidPackageName: str(process.env.EXPO_PUBLIC_ANDROID_PACKAGE_NAME),
  },

  links: {
    supportEmail: str(process.env.EXPO_PUBLIC_SUPPORT_EMAIL),
    privacyUrl: str(process.env.EXPO_PUBLIC_PRIVACY_URL),
    termsUrl: str(process.env.EXPO_PUBLIC_TERMS_URL),
  },
} as const;

/** Public SDK key for the platform we are running on. */
export function revenueCatApiKey(): string {
  return Platform.select({
    ios: env.revenueCat.iosApiKey,
    android: env.revenueCat.androidApiKey,
    default: '',
  });
}

/**
 * True when a usable RevenueCat key is present. When false the app runs in a
 * "no billing configured" mode: gating still works, the paywall explains that
 * purchases are unavailable, and nothing crashes.
 */
export function isPurchasesConfigured(): boolean {
  const key = revenueCatApiKey();
  return key.length > 0 && !key.includes('XXXX');
}
