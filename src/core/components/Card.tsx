import type { PropsWithChildren } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../theme';

export type CardProps = PropsWithChildren<{
  /** `tint` is the light-blue card of the handoff; `plain` the white one. */
  tone?: 'plain' | 'tint';
  style?: StyleProp<ViewStyle>;
}>;

/** Handoff card: radius 20, 1 px border, 18 padding. Never black. */
export function Card({ children, tone = 'plain', style }: CardProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: tone === 'tint' ? theme.colors.primarySoft : theme.colors.surface,
          borderColor: tone === 'tint' ? theme.colors.primarySoftBorder : theme.colors.border,
          borderWidth: 1,
          borderRadius: theme.radius.card,
          padding: 18,
          gap: theme.spacing.md,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
