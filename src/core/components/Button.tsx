import { ActivityIndicator, Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../theme';
import type { Icon } from './icons';
import { Text } from './Text';

/**
 * `primary` is the blue CTA, `secondary` the outlined one on the surface,
 * `link` the underlined text button ("Pular por enquanto"), `danger` a
 * destructive action in a dialog.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'link' | 'danger';

export type ButtonProps = {
  /** Already-translated label. Components never hold literal copy. */
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  /** Icon shown before the label. */
  icon?: Icon;
  /** The sticky FAB's drop shadow. */
  elevated?: boolean;
  /** `link` only: the underline of "Pular por enquanto"; the onboarding's "Pular" has none. */
  underline?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
};

/** CTA height from the handoff (54–56). */
const ALTURA_CTA = 56;

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon: Glyph,
  elevated = false,
  underline = true,
  style,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;
  const link = variant === 'link';

  const fundo: Record<ButtonVariant, string> = {
    primary: theme.colors.primary,
    secondary: theme.colors.surface,
    link: 'transparent',
    danger: theme.colors.dangerSoft,
  };
  const fundoPressionado: Record<ButtonVariant, string> = {
    ...fundo,
    primary: theme.colors.primaryPressed,
    secondary: theme.colors.surfaceElevated,
  };
  const corTexto: Record<ButtonVariant, string> = {
    primary: isDisabled && !loading ? theme.colors.textMuted : theme.colors.onPrimary,
    secondary: theme.colors.text,
    link: theme.colors.textMuted,
    danger: theme.colors.onDangerSoft,
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      testID={testID}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        {
          minHeight: link ? 44 : ALTURA_CTA,
          justifyContent: 'center',
          // A disabled CTA is grey, not a faded blue (design Estado-negocio-0).
          backgroundColor:
            isDisabled && !loading && variant === 'primary'
              ? theme.colors.border
              : pressed
                ? fundoPressionado[variant]
                : fundo[variant],
          borderRadius: theme.radius.lg,
          borderWidth: variant === 'secondary' ? 1 : 0,
          borderColor: theme.colors.borderInput,
          paddingHorizontal: link ? theme.spacing.xs : theme.spacing.lg,
          opacity:
            isDisabled && !(variant === 'primary' && !loading) ? 0.5 : link && pressed ? 0.6 : 1,
        },
        elevated && {
          shadowColor: theme.colors.primary,
          shadowOpacity: theme.scheme === 'dark' ? 0 : 0.28,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 10 },
          elevation: 6,
        },
        style,
      ]}
    >
      <View
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
      >
        {loading ? (
          <ActivityIndicator size="small" color={corTexto[variant]} />
        ) : Glyph ? (
          <Glyph size={20} strokeWidth={2.2} color={corTexto[variant]} />
        ) : null}
        <Text
          variant="button"
          style={[
            { color: corTexto[variant], textAlign: 'center', flexShrink: 1 },
            link && {
              fontSize: 15,
              textDecorationLine: underline ? 'underline' : 'none',
            },
          ]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
