import Ionicons from '@expo/vector-icons/Ionicons';
import { View, type ColorValue } from 'react-native';

import { openPaywall } from '../purchases';
import { isUnlocked } from '../purchases/gating';

/**
 * Reusable "tab with a padlock" pattern.
 *
 * A locked tab stays visible so users can discover the feature, but tapping it
 * is intercepted and routed to the paywall instead of mounting the screen.
 *
 * ```tsx
 * <Tabs.Screen
 *   name="pro"
 *   options={{
 *     title: t('tabs.pro'),
 *     tabBarIcon: ({ color, size }) => (
 *       <LockedTabIcon name="sparkles-outline" color={color} size={size} locked={!unlocked} />
 *     ),
 *   }}
 *   listeners={lockedTabListeners('pro')}
 * />
 * ```
 */

/** `listeners` for a `Tabs.Screen` that must be unlocked before it opens. */
export function lockedTabListeners(source?: string) {
  return () => ({
    tabPress: (event: { preventDefault: () => void }) => {
      if (isUnlocked()) return;
      event.preventDefault();
      openPaywall(source);
    },
  });
}

export type LockedTabIconProps = {
  name: keyof typeof Ionicons.glyphMap;
  color: ColorValue;
  size: number;
  locked: boolean;
};

/** Tab icon with a small padlock badge while the feature is locked. */
export function LockedTabIcon({ name, color, size, locked }: LockedTabIconProps) {
  return (
    <View>
      <Ionicons name={name} size={size} color={color} />
      {locked ? (
        <Ionicons
          name="lock-closed"
          size={Math.round(size * 0.5)}
          color={color}
          style={{ position: 'absolute', right: -6, bottom: -2 }}
        />
      ) : null}
    </View>
  );
}
