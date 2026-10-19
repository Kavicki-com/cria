import { Pressable, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../theme';
import type { Icon } from './icons';

export type IconButtonProps = {
  icon: Icon;
  /** Already-translated label, read by screen readers. */
  accessibilityLabel: string;
  onPress: () => void;
  /** `round` is the white circle with a border (Ajustes on Meus negócios). */
  variant?: 'plain' | 'round';
  size?: number;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** A 44 pt touch target holding one icon: back, close, settings. */
export function IconButton({
  icon: Glyph,
  accessibilityLabel,
  onPress,
  variant = 'plain',
  size = 24,
  disabled = false,
  style,
}: IconButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [
        {
          width: 44,
          height: 44,
          borderRadius: 22,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.6 : disabled ? 0.4 : 1,
        },
        variant === 'round' && {
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        style,
      ]}
    >
      <Glyph size={size} strokeWidth={2} color={theme.colors.text} />
    </Pressable>
  );
}
