import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';

import { useTranslation } from '@/core/i18n/useTranslation';
import { LockedTabIcon, lockedTabListeners } from '@/core/paywall';
import { useUnlock } from '@/core/purchases';
import { useTheme } from '@/core/theme';

export default function TabsLayout() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { unlocked } = useUnlock();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTitleStyle: { color: theme.colors.text },
        tabBarStyle: { backgroundColor: theme.colors.tabBar, borderTopColor: theme.colors.border },
        tabBarActiveTintColor: theme.colors.tabActive,
        tabBarInactiveTintColor: theme.colors.tabInactive,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      {/*
        Locked tab pattern: the tab stays visible for discoverability, but the
        press is intercepted while the app is locked and sent to the paywall.
      */}
      <Tabs.Screen
        name="pro"
        options={{
          title: t('tabs.pro'),
          tabBarIcon: ({ color, size }) => (
            <LockedTabIcon name="sparkles-outline" color={color} size={size} locked={!unlocked} />
          ),
        }}
        listeners={lockedTabListeners('tab-pro')}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
