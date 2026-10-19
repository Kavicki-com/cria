// Each weight is imported by path, never from the package barrel: the barrel
// `require`s every .ttf of the family (18 files for Poppins), and Metro ships
// every asset it can see whether or not it is used — the same trap as the
// `@expo/vector-icons` barrel (see CLAUDE.md, "Config traps").
import { Poppins_600SemiBold } from '@expo-google-fonts/poppins/600SemiBold';
import { Roboto_400Regular } from '@expo-google-fonts/roboto/400Regular';
import { Roboto_500Medium } from '@expo-google-fonts/roboto/500Medium';
import { Roboto_700Bold } from '@expo-google-fonts/roboto/700Bold';
import { useFonts } from 'expo-font';

import { fonts } from './tokens';

/**
 * The font files, keyed by the family names in `fonts`. Also read by the PDF,
 * whose print WebView cannot see the app's registered fonts and gets them as
 * base64 `@font-face` instead.
 */
export const fontFiles = {
  [fonts.display]: Poppins_600SemiBold,
  [fonts.regular]: Roboto_400Regular,
  [fonts.medium]: Roboto_500Medium,
  [fonts.bold]: Roboto_700Bold,
} as const;

/**
 * Loads the app's fonts at runtime, keyed by the names in `fonts`.
 *
 * Runtime loading (not the expo-font config plugin) so the same code works in
 * Expo Go, which cannot embed fonts at build time. The files are bundled
 * assets, so this works offline.
 *
 * Returns true once the fonts are usable OR loading failed: a failed load
 * falls back to the system font, which is worse-looking but better than an
 * app stuck on its splash screen forever.
 */
export function useAppFonts(): boolean {
  const [loaded, error] = useFonts(fontFiles);
  return loaded || error !== null;
}
