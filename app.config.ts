import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Cria — Meu plano de negócios. Expo config, built on the Kavicki starter kit.
 *
 * Notes:
 * - `react-native-purchases` (RevenueCat) and `expo-system-ui` ship no config
 *   plugin: both are autolinked by the Expo prebuild, so they must NOT be
 *   listed in `plugins`. RevenueCat requires a dev build (it is a native
 *   module and does NOT work in Expo Go), plus the Android billing permission
 *   declared below. `expo-system-ui` is what makes `userInterfaceStyle`
 *   actually take effect on Android — without it the dark theme is ignored.
 * - `expo-notifications` is used in LOCAL mode only. Its own manifest already
 *   declares `POST_NOTIFICATIONS`; the runtime request for Android 13+ lives in
 *   `src/core/notifications`.
 */

const APP_NAME = 'Cria';
const APP_SLUG = 'cria';
const APP_SCHEME = 'cria';
const BUNDLE_ID = 'com.kavicki.cria';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  owner: 'kavickicom',
  name: APP_NAME,
  slug: APP_SLUG,
  scheme: APP_SCHEME,
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  icon: './assets/images/icon.png',
  assetBundlePatterns: ['**/*'],
  ios: {
    bundleIdentifier: BUNDLE_ID,
    supportsTablet: true,
    config: {
      usesNonExemptEncryption: false,
    },
  },
  android: {
    package: BUNDLE_ID,
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
    // `com.android.vending.BILLING` is required by Google Play Billing, which
    // backs the RevenueCat non-consumable unlock. `VIBRATE` and `INTERNET` come
    // from the Expo template and are both needed: the reminder channel vibrates,
    // and RevenueCat talks to the store.
    permissions: ['com.android.vending.BILLING'],
    // The Expo Android template also injects storage and overlay permissions.
    // An offline, no-backend app needs none of them, and shipping them invites
    // questions in Play review — so strip them from the merged manifest.
    blockedPermissions: [
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.SYSTEM_ALERT_WINDOW',
    ],
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        resizeMode: 'contain',
        backgroundColor: '#FFFFFF',
        dark: {
          backgroundColor: '#0B0B0F',
        },
      },
    ],
    [
      'expo-notifications',
      {
        color: '#2563EB',
        // Local notifications only — no FCM / APNs remote push is configured.
        mode: 'development',
        enableBackgroundRemoteNotifications: false,
      },
    ],
    [
      'expo-localization',
      {
        supportsRTL: false,
        supportedLocales: ['pt-BR', 'en', 'es'],
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {},
    /**
     * Cria's own EAS project (@kavickicom/cria), printed by `eas init`.
     *
     * A literal on purpose: `eas init` cannot write into a TypeScript config,
     * and `.env.local` is never seen by the EAS build server. Never replace it
     * with an invented UUID — EAS then fails with "Experience with id '…' does
     * not exist", which names nothing useful.
     */
    eas: { projectId: 'f6d8192e-f1ce-4012-ba90-ede4dcd31ec1' },
  },
});
