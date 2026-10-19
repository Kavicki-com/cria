import { SettingsScreen } from '@/core/settings';

/**
 * Settings tab. Add app-specific rows by passing them as children:
 *
 * ```tsx
 * <SettingsScreen>
 *   <MyAppSection />
 * </SettingsScreen>
 * ```
 */
export default function SettingsRoute() {
  return <SettingsScreen />;
}
