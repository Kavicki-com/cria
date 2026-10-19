import type { PropsWithChildren } from 'react';
import { View } from 'react-native';

import { useTheme } from '../theme';
import { Text } from './Text';

export type SettingsSectionProps = PropsWithChildren<{
  /** Already-translated section title. */
  title: string;
}>;

export function SettingsSection({ title, children }: SettingsSectionProps) {
  const theme = useTheme();

  return (
    <View style={{ gap: theme.spacing.sm }}>
      <Text variant="caption" color="textMuted" style={{ textTransform: 'uppercase' }}>
        {title}
      </Text>
      <View
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderWidth: 1,
          borderRadius: theme.radius.lg,
          overflow: 'hidden',
        }}
      >
        {children}
      </View>
    </View>
  );
}
