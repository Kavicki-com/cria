import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { configureNotificationHandler, ensureAndroidChannel } from '@/core/notifications';
import { usePurchasesBootstrap } from '@/core/purchases';
import { useRegisterLaunch } from '@/core/rating';
import { useConfigStore } from '@/core/storage';
import { ThemeProvider, useAppFonts, useTheme } from '@/core/theme';
import { prepararBanco } from '@/data';

// Foreground behaviour must be registered before the first notification
// arrives, so it runs at module scope rather than in an effect.
configureNotificationHandler();

// Keep the splash up until the fonts are in: rendering first would paint every
// title in the system font and then swap it, a visible jump on each launch.
void SplashScreen.preventAutoHideAsync().catch(() => {
  // Already hidden or not available — the app still renders, just unguarded.
});

export default function RootLayout() {
  const fontsReady = useAppFonts();
  // Resolves at once natively; on the web preview it waits for SQLite's worker.
  const [bancoPronto, setBancoPronto] = useState(false);

  useEffect(() => {
    void prepararBanco().then(() => setBancoPronto(true));
  }, []);

  useEffect(() => {
    if (fontsReady && bancoPronto) void SplashScreen.hideAsync().catch(() => {});
  }, [fontsReady, bancoPronto]);

  if (!fontsReady || !bancoPronto) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <RootNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function RootNavigator() {
  const theme = useTheme();
  const onboardingCompleted = useConfigStore((state) => state.onboardingCompleted);

  // Configures RevenueCat and keeps the cached unlock flag in sync.
  usePurchasesBootstrap();
  // One launch per app start, for the rating prompt's policy.
  useRegisterLaunch();

  useEffect(() => {
    void ensureAndroidChannel();
  }, []);

  return (
    <>
      <StatusBar style={theme.scheme === 'dark' ? 'light' : 'dark'} />
      {/* Every screen draws its own top bar, as in the design: no native header. */}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        {/* Gate the app behind onboarding without an imperative redirect. */}
        <Stack.Protected guard={onboardingCompleted}>
          <Stack.Screen name="index" />
          <Stack.Screen name="ajustes" />
          <Stack.Screen name="negocio/novo" options={{ presentation: 'modal' }} />
          <Stack.Screen name="negocio/[id]/index" />
          <Stack.Screen name="negocio/[id]/editar" options={{ presentation: 'modal' }} />
          <Stack.Screen name="negocio/[id]/lean" />
          <Stack.Screen name="negocio/[id]/lean-revisao" />
          <Stack.Screen name="negocio/[id]/equilibrio" />
        </Stack.Protected>

        <Stack.Protected guard={!onboardingCompleted}>
          <Stack.Screen name="onboarding" />
        </Stack.Protected>

        {/* Reachable from anywhere, onboarding included (deep links). */}
        <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
        <Stack.Screen name="restaurar" options={{ presentation: 'modal' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}
