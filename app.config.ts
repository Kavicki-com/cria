import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Kavicki starter kit — base Expo config.
 *
 * Each app cloned from this template should override `name`, `slug`, `scheme`,
 * `ios.bundleIdentifier`, `android.package` and the EAS project id.
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

const APP_NAME = 'Kavicki Starter Kit';
const APP_SLUG = 'kavicki-starter-kit';
const APP_SCHEME = 'kavickistarter';
const BUNDLE_ID = 'com.kavicki.starterkit';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
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
     * This is the KIT'S OWN id, committed because this repo is itself built
     * and shipped from — leaving it out meant re-pasting it after every pull.
     *
     * Each app runs `eas init` and REPLACES it with the printed id, as a
     * literal (it cannot come from `.env.local`: the EAS build server never
     * sees that file). Never invent a UUID: a fake id makes EAS look up a
     * project that does not exist and fail with "Experience with id '…' does
     * not exist", which tells you nothing, and with a bad id even
     * `eas project:info` fails the same way — `eas init` is the only way in.
     *
     * Keeping the kit's id in an app would silently send its builds into the
     * kit's EAS project; `check-invariants` refuses it once `kavickiTemplate`
     * is deleted from package.json.
     */
    eas: { projectId: 'd68b190b-270b-46bb-9b15-dc7289322c92' },
  },
});
