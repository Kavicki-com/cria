import { Platform, type TextStyle } from 'react-native';

/**
 * Design tokens for the starter kit.
 *
 * Each app should override the palette here (or fork this file) instead of
 * hard-coding colors in components.
 */

export type ColorScheme = 'light' | 'dark';

export type ColorTokens = {
  background: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  text: string;
  textMuted: string;
  textInverted: string;
  primary: string;
  primaryPressed: string;
  onPrimary: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
  overlay: string;
  tabBar: string;
  tabActive: string;
  tabInactive: string;
};

const lightColors: ColorTokens = {
  background: '#F7F8FA',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  border: '#E3E6EC',
  text: '#11131A',
  textMuted: '#5B6376',
  textInverted: '#FFFFFF',
  primary: '#2563EB',
  primaryPressed: '#1D4ED8',
  onPrimary: '#FFFFFF',
  accent: '#7C3AED',
  success: '#15803D',
  warning: '#B45309',
  danger: '#B91C1C',
  overlay: 'rgba(17, 19, 26, 0.45)',
  tabBar: '#FFFFFF',
  tabActive: '#2563EB',
  tabInactive: '#8A91A3',
};

const darkColors: ColorTokens = {
  background: '#0B0B0F',
  surface: '#15161C',
  surfaceElevated: '#1D1F27',
  border: '#2A2D38',
  text: '#F4F5F7',
  textMuted: '#9BA2B2',
  textInverted: '#11131A',
  primary: '#60A5FA',
  primaryPressed: '#3B82F6',
  onPrimary: '#0B0B0F',
  accent: '#A78BFA',
  success: '#4ADE80',
  warning: '#FBBF24',
  danger: '#F87171',
  overlay: 'rgba(0, 0, 0, 0.6)',
  tabBar: '#15161C',
  tabActive: '#60A5FA',
  tabInactive: '#6F7687',
};

export const palettes: Record<ColorScheme, ColorTokens> = {
  light: lightColors,
  dark: darkColors,
};

export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

const fontFamily = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

export type TypographyVariant =
  'display' | 'title' | 'heading' | 'body' | 'bodyStrong' | 'caption' | 'button';

export const typography: Record<TypographyVariant, TextStyle> = {
  display: { fontFamily, fontSize: 32, lineHeight: 38, fontWeight: '700' },
  title: { fontFamily, fontSize: 24, lineHeight: 30, fontWeight: '700' },
  heading: { fontFamily, fontSize: 18, lineHeight: 24, fontWeight: '600' },
  body: { fontFamily, fontSize: 16, lineHeight: 22, fontWeight: '400' },
  bodyStrong: { fontFamily, fontSize: 16, lineHeight: 22, fontWeight: '600' },
  caption: { fontFamily, fontSize: 13, lineHeight: 18, fontWeight: '400' },
  button: { fontFamily, fontSize: 16, lineHeight: 20, fontWeight: '600' },
};

export type Theme = {
  scheme: ColorScheme;
  colors: ColorTokens;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
};

export function buildTheme(scheme: ColorScheme): Theme {
  return { scheme, colors: palettes[scheme], spacing, radius, typography };
}
