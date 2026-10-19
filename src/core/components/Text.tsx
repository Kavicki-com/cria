import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { useTheme } from '../theme';
import type { ColorTokens, TypographyVariant } from '../theme';

export type TextProps = RNTextProps & {
  variant?: TypographyVariant;
  color?: keyof ColorTokens;
  center?: boolean;
};

/** Typography-aware Text. Content always comes from the caller via i18n. */
export function Text({ variant = 'body', color = 'text', center, style, ...rest }: TextProps) {
  const theme = useTheme();

  return (
    <RNText
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
