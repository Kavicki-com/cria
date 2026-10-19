import { ActivityIndicator, Pressable, View, type ViewStyle } from 'react-native';

import { useTheme } from '../theme';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export type ButtonProps = {
  /** Already-translated label. Components never hold literal copy. */
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
  testID?: string;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  accessibilityLabel,
  testID,
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const background: Record<ButtonVariant, string> = {
    primary: theme.colors.primary,
    secondary: theme.colors.surfaceElevated,
    ghost: 'transparent',
    danger: theme.colors.danger,
  };

  const labelColor =
    variant === 'primary' || variant === 'danger'
      ? theme.colors.onPrimary
      : variant === 'ghost'
        ? theme.colors.primary
        : theme.colors.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      testID={testID}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        {
          backgroundColor:
            pressed && variant === 'primary' ? theme.colors.primaryPressed : background[variant],
          borderRadius: theme.radius.md,
          borderWidth: variant === 'secondary' ? 1 : 0,
          borderColor: theme.colors.border,
          paddingVertical: theme.spacing.md + 2,
          paddingHorizontal: theme.spacing.lg,
          opacity: isDisabled ? 0.55 : 1,
        },
        style,
      ]}
    >
      <View
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
      >
        {loading ? <ActivityIndicator size="small" color={labelColor} /> : null}
        <Text variant="button" style={{ color: labelColor }}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
