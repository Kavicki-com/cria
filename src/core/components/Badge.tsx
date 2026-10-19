import { View } from 'react-native';

import { useTheme } from '../theme';
import type { ColorTokens } from '../theme';
import { Text } from './Text';

export type BadgeProps = {
  /** Already-translated label. */
  label: string;
  tone?: Extract<keyof ColorTokens, 'primary' | 'success' | 'warning' | 'danger' | 'textMuted'>;
};

export function Badge({ label, tone = 'primary' }: BadgeProps) {
  const theme = useTheme();

  return (
    <View
      style={{
        alignSelf: 'flex-start',
        borderRadius: theme.radius.pill,
        borderWidth: 1,
        borderColor: theme.colors[tone],
        paddingVertical: theme.spacing.xs,
        paddingHorizontal: theme.spacing.md,
      }}
    >
      <Text variant="caption" style={{ color: theme.colors[tone] }}>
        {label}
      </Text>
    </View>
  );
}
