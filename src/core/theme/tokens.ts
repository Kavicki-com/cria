import type { TextStyle } from 'react-native';

/**
 * Design tokens — Cria.
 *
 * Values are the design handoff's (`docs/cria/design/Guia-de-estilo` and the
 * `Escuro-*` screens). The handoff gives the dark palette for surfaces, text
 * and the primary; the soft accent, the success seal and the error colors in
 * dark were checked against the `Escuro-*` screens where they appear and
 * derived where they do not, keeping text/background pairs at WCAG AA.
 *
 * Rules from the handoff: cards use the light blue tint, never black; the
 * "Plano liberado" seal and the break-even card are green (success), never
 * red; the PDF is always light (`paper`), whatever the app theme.
 */

export type ColorScheme = 'light' | 'dark';

export type ColorTokens = {
  /** Screen background (warm paper in light). */
  background: string;
  /** Cards, inputs, list groups. */
  surface: string;
  /** Pressed rows, the segmented control's track. */
  surfaceElevated: string;
  /** Card border. */
  border: string;
  /** Input, chip and secondary-button border at rest. */
  borderInput: string;
  /** Hairline between rows inside one card. */
  divider: string;
  /** Progress-bar track. */
  track: string;
  /** Empty-state circle, the quiet fill behind an illustration. */
  neutralFill: string;

  /** Titles and main text. */
  text: string;
  /** Paragraph text inside cards. */
  textBody: string;
  /** Support text and captions. */
  textMuted: string;
  /** Chevrons, placeholders. */
  textFaint: string;
  /** Text on `text` used as a background. */
  textInverted: string;

  /** CTAs and the progress fill. */
  primary: string;
  primaryPressed: string;
  /** Text and icons on `primary`. */
  onPrimary: string;
  /** The primary used as a FOREGROUND (links, percentages, labels). */
  primaryText: string;
  /** Card tint, selected chips, the "Grátis" pill. */
  primarySoft: string;
  /** Border of a `primarySoft` card. */
  primarySoftBorder: string;
  /** Muted text on `primary` (the unlock card in Ajustes). */
  onPrimaryMuted: string;

  /** Goiaba: the "current" segment, achievement moments, the logo dot. */
  accent: string;
  /** Text on `accent` (the "Mais vantajoso" pill). */
  onAccent: string;
  accentSoft: string;
  /** Text on `accentSoft` (notices). */
  onAccentSoft: string;

  success: string;
  successSoft: string;
  /** Text on `successSoft` (the "Plano liberado" seal). */
  onSuccessSoft: string;

  /** The break-even card (design Ponto-equilibrio): green, never red. */
  equilibrioFundo: string;
  equilibrioBorda: string;
  /** Its paragraph text; the big number uses `onSuccessSoft`. */
  equilibrioTexto: string;
  /** Labels inside its white tiles. */
  equilibrioRotulo: string;
  /** The "custo" share of the price bar; the rest is `success`. */
  equilibrioCusto: string;

  danger: string;
  dangerSoft: string;
  onDangerSoft: string;
  warning: string;

  /** SWOT "Ameaças" tag and quadrant (design Swot): lavender. */
  lilasSoft: string;
  onLilasSoft: string;

  /** Behind sheets and dialogs. */
  scrim: string;
  /** PDF paper and the splash. Light in both themes. */
  paper: string;

  // Kept for the kit's core components.
  overlay: string;
  tabBar: string;
  tabActive: string;
  tabInactive: string;
};

const lightColors: ColorTokens = {
  background: '#FAF7F2',
  surface: '#FFFFFF',
  surfaceElevated: '#EDE8DF',
  border: '#E7E1D7',
  borderInput: '#D6CFC3',
  divider: '#EFEAE1',
  track: '#EDE8DF',
  neutralFill: '#EFEAE1',

  text: '#18212E',
  textBody: '#3A4555',
  textMuted: '#545F6E',
  textFaint: '#8A93A0',
  textInverted: '#FFFFFF',

  primary: '#1F4F8F',
  primaryPressed: '#173B6C',
  onPrimary: '#FFFFFF',
  primaryText: '#1F4F8F',
  primarySoft: '#E4ECF7',
  primarySoftBorder: '#C9D7EE',
  onPrimaryMuted: '#D3E0F2',

  accent: '#EF6F7A',
  onAccent: '#3A0E14',
  accentSoft: '#FCE3E5',
  onAccentSoft: '#8A2433',

  success: '#1D7A52',
  successSoft: '#DDF3E7',
  onSuccessSoft: '#145C3D',

  equilibrioFundo: '#E7F5EC',
  equilibrioBorda: '#BFE3CD',
  equilibrioTexto: '#2F4A3C',
  equilibrioRotulo: '#4A6356',
  equilibrioCusto: '#63D773',

  danger: '#B3261E',
  dangerSoft: '#FBE9E7',
  onDangerSoft: '#8C1D18',
  warning: '#8A5A00',

  lilasSoft: '#ECE7F5',
  onLilasSoft: '#4B2E83',

  scrim: 'rgba(24, 33, 46, 0.55)',
  paper: '#FFFDF9',

  overlay: 'rgba(24, 33, 46, 0.55)',
  tabBar: '#FFFFFF',
  tabActive: '#1F4F8F',
  tabInactive: '#545F6E',
};

const darkColors: ColorTokens = {
  background: '#10151D',
  surface: '#19212C',
  surfaceElevated: '#222C39',
  border: '#2A3442',
  borderInput: '#3A4556',
  divider: '#2A3442',
  track: '#2A3442',
  neutralFill: '#19212C',

  text: '#ECF0F5',
  textBody: '#C3CBD6',
  textMuted: '#A6B0BE',
  textFaint: '#7D8796',
  textInverted: '#10151D',

  primary: '#8DB6EE',
  primaryPressed: '#B5D0F5',
  onPrimary: '#0D1A2E',
  primaryText: '#8DB6EE',
  primarySoft: '#1E2E47',
  primarySoftBorder: '#2A3F5C',
  onPrimaryMuted: '#1E3A61',

  accent: '#EF6F7A',
  onAccent: '#3A0E14',
  // Not in the handoff: a deep goiaba under the light pink text, 9.6:1.
  accentSoft: '#3A1F26',
  onAccentSoft: '#F6B3BA',

  success: '#7FD3A8',
  successSoft: '#163527',
  onSuccessSoft: '#9FE0BE',

  // Not in the handoff: the same green family on the dark surface.
  equilibrioFundo: '#163527',
  equilibrioBorda: '#24543D',
  equilibrioTexto: '#C4EBD6',
  equilibrioRotulo: '#9FCDB6',
  equilibrioCusto: '#3E9C66',

  // Not in the handoff (its error swatch is the light one). Material's dark
  // error pair, 8.9:1 on `dangerSoft`.
  danger: '#F2B8B5',
  dangerSoft: '#3B1714',
  onDangerSoft: '#F9DEDC',
  warning: '#F2C661',

  lilasSoft: '#2A2340',
  onLilasSoft: '#CBB8F0',

  scrim: 'rgba(0, 0, 0, 0.6)',
  paper: '#FFFDF9',

  overlay: 'rgba(0, 0, 0, 0.6)',
  tabBar: '#19212C',
  tabActive: '#8DB6EE',
  tabInactive: '#A6B0BE',
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
  /** Horizontal screen padding (the handoff's 20). */
  tela: 20,
} as const;

/** Radii from the handoff, by the component that uses them. */
export const radius = {
  sm: 6,
  /** Small buttons, the segmented control's thumb. */
  md: 10,
  /** Inputs, the segmented control. */
  input: 14,
  /** Buttons (14–16), list groups. */
  lg: 16,
  /** Price cards. */
  price: 18,
  /** Cards. */
  card: 20,
  xl: 24,
  /** Top of sheets and dialogs. */
  sheet: 28,
  pill: 999,
} as const;

/**
 * Font family names as registered by `useAppFonts` (src/core/theme/fonts.ts).
 *
 * One family PER WEIGHT, and never a `fontWeight` next to it: on Android a
 * custom font's weight is chosen by the file, not by `fontWeight`, so
 * `{ fontFamily: 'Roboto', fontWeight: '700' }` renders the regular file (or a
 * synthesized bold) instead of Roboto Bold.
 *
 * The handoff's "600" on Roboto text resolves to Bold, as it does in the
 * browser the design was drawn in: only 400, 500 and 700 are loaded.
 */
export const fonts = {
  display: 'Poppins_600SemiBold',
  regular: 'Roboto_400Regular',
  medium: 'Roboto_500Medium',
  bold: 'Roboto_700Bold',
} as const;

export type TypographyVariant =
  | 'display'
  | 'title'
  | 'question'
  | 'heading'
  | 'subheading'
  | 'body'
  | 'bodyStrong'
  | 'support'
  | 'caption'
  | 'captionStrong'
  | 'label'
  | 'button';

/**
 * From the style guide: screen title Poppins 600 30–34/1.08, form question
 * 28/1.15, card title 20 — with the line height raised to ~1.25: Poppins's
 * accents sit above the em box, and at 1.08 the "ó" of "negócio" is clipped; text and answers Roboto 17/1.5, support 15/1.45,
 * block label Roboto 700 13 in caps. One-off sizes override `fontSize` on top
 * of a variant rather than growing this list.
 */
export const typography: Record<TypographyVariant, TextStyle> = {
  display: { fontFamily: fonts.display, fontSize: 34, lineHeight: 41, letterSpacing: -0.68 },
  title: { fontFamily: fonts.display, fontSize: 30, lineHeight: 39, letterSpacing: -0.6 },
  question: { fontFamily: fonts.display, fontSize: 28, lineHeight: 36, letterSpacing: -0.42 },
  heading: { fontFamily: fonts.display, fontSize: 20, lineHeight: 27 },
  subheading: { fontFamily: fonts.display, fontSize: 17, lineHeight: 24 },
  body: { fontFamily: fonts.regular, fontSize: 17, lineHeight: 25 },
  bodyStrong: { fontFamily: fonts.bold, fontSize: 17, lineHeight: 25 },
  support: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22 },
  caption: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 19 },
  captionStrong: { fontFamily: fonts.bold, fontSize: 13, lineHeight: 18 },
  label: {
    fontFamily: fonts.bold,
    fontSize: 13,
    lineHeight: 17,
    letterSpacing: 0.78,
    textTransform: 'uppercase',
  },
  button: { fontFamily: fonts.bold, fontSize: 17, lineHeight: 21 },
};

export type Theme = {
  scheme: ColorScheme;
  colors: ColorTokens;
  spacing: typeof spacing;
  radius: typeof radius;
  fonts: typeof fonts;
  typography: typeof typography;
};

export function buildTheme(scheme: ColorScheme): Theme {
  return { scheme, colors: palettes[scheme], spacing, radius, fonts, typography };
}
