import type { ReactNode } from 'react';
import { View } from 'react-native';

import { useTheme } from '../theme';
import { Text } from './Text';

export type BadgeTone = 'primary' | 'success' | 'accent' | 'danger' | 'solid';

export type BadgeProps = {
  /** Already-translated label. */
  label: string;
  tone?: BadgeTone;
  /** Optional leading icon, already coloured by the caller. */
  icon?: ReactNode;
};

/** Pill from the handoff: soft background, strong text, 13 bold. */
export function Badge({ label, tone = 'primary', icon }: BadgeProps) {
  const theme = useTheme();

  const fundo: Record<BadgeTone, string> = {
    primary: theme.colors.primarySoft,
    success: theme.colors.successSoft,
    accent: theme.colors.accentSoft,
    danger: theme.colors.dangerSoft,
    solid: theme.colors.primary,
  };
  const texto: Record<BadgeTone, string> = {
    primary: theme.colors.primaryText,
    success: theme.colors.onSuccessSoft,
    accent: theme.colors.onAccentSoft,
    danger: theme.colors.onDangerSoft,
    solid: theme.colors.onPrimary,
  };

  return (
    <View
      style={{
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderRadius: theme.radius.pill,
        backgroundColor: fundo[tone],
        paddingVertical: 6,
        paddingHorizontal: 12,
      }}
    >
      {icon}
      <Text variant="captionStrong" style={{ color: texto[tone] }}>
        {label}
      </Text>
    </View>
  );
}

/** The colour a Badge's text uses for `tone`, for an icon placed inside it. */
export function useBadgeColor(tone: BadgeTone): string {
  const theme = useTheme();
  const cores: Record<BadgeTone, string> = {
    primary: theme.colors.primaryText,
    success: theme.colors.onSuccessSoft,
    accent: theme.colors.onAccentSoft,
    danger: theme.colors.onDangerSoft,
    solid: theme.colors.onPrimary,
  };
  return cores[tone];
}
