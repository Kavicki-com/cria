import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useTranslation } from '@/core/i18n/useTranslation';
import { configureNotificationHandler, ensureAndroidChannel } from '@/core/notifications';
import { usePurchasesBootstrap } from '@/core/purchases';
import { useConfigStore } from '@/core/storage';
import { ThemeProvider, useTheme } from '@/core/theme';

// Foreground behaviour must be registered before the first notification
// arrives, so it runs at module scope rather than in an effect.
configureNotificationHandler();

export default function RootLayout() {
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
  const { t } = useTranslation();
  const onboardingCompleted = useConfigStore((state) => state.onboardingCompleted);

  // Configures RevenueCat and keeps the cached unlock flag in sync.
  usePurchasesBootstrap();

  useEffect(() => {
    void ensureAndroidChannel();
  }, []);

  return (
    <>
      <StatusBar style={theme.scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTitleStyle: { color: theme.colors.text },
          headerTintColor: theme.colors.primary,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        {/* Gate the tabs behind onboarding without an imperative redirect. */}
        <Stack.Protected guard={onboardingCompleted}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack.Protected>

        <Stack.Protected guard={!onboardingCompleted}>
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        </Stack.Protected>

        <Stack.Screen
          name="paywall"
          options={{ presentation: 'modal', title: t('paywall.title') }}
        />
        <Stack.Screen name="+not-found" options={{ title: t('notFound.title') }} />
      </Stack>
    </>
  );
}
