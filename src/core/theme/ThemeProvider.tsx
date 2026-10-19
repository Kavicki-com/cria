import { createContext, useMemo, type PropsWithChildren } from 'react';
import { useColorScheme } from 'react-native';

import { useConfigStore } from '../storage/configStore';
import { buildTheme, type ColorScheme, type Theme } from './tokens';

export const ThemeContext = createContext<Theme>(buildTheme('light'));

/**
 * Resolves the active color scheme from the user's stored preference, falling
 * back to the OS setting when the preference is `system`.
 */
export function ThemeProvider({ children }: PropsWithChildren) {
  const preference = useConfigStore((state) => state.theme);
  const systemScheme = useColorScheme();

  const scheme: ColorScheme =
    preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;

  const theme = useMemo(() => buildTheme(scheme), [scheme]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}
