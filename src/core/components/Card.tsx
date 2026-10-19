import type { PropsWithChildren } from 'react';
import { View, type ViewStyle } from 'react-native';

import { useTheme } from '../theme';

export type CardProps = PropsWithChildren<{ style?: ViewStyle }>;

export function Card({ children, style }: CardProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderWidth: 1,
          borderRadius: theme.radius.lg,
          padding: theme.spacing.lg,
          gap: theme.spacing.sm,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
