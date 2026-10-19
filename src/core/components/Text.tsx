import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { useTheme } from '../theme';
import type { ColorTokens, TypographyVariant } from '../theme';

export type TextProps = RNTextProps & {
  variant?: TypographyVariant;
  color?: keyof ColorTokens;
  center?: boolean;
};

/**
 * Text follows the system font size up to 200% (plan §11, fase 7): beyond
 * that, fixed-height elements (tiles, rings, the segmented control) stop
 * fitting, and 200% is what WCAG asks to support without loss.
 */
export const MAX_ESCALA_FONTE = 2;

/** Typography-aware Text. Content always comes from the caller via i18n. */
export function Text({ variant = 'body', color = 'text', center, style, ...rest }: TextProps) {
  const theme = useTheme();

  return (
    <RNText
      maxFontSizeMultiplier={MAX_ESCALA_FONTE}
      style={[
        theme.typography[variant],
        { color: theme.colors[color] },
        center && { textAlign: 'center' },
        style,
      ]}
      {...rest}
    />
  );
}
