import { Pressable, Switch, View } from 'react-native';

import { useTheme } from '../theme';
import { Text } from './Text';

export type SettingsRowProps = {
  /** Already-translated label and hint. */
  label: string;
  hint?: string;
  /** Right-hand value text, e.g. the current language. */
  value?: string;
  onPress?: () => void;
  /** Renders a switch instead of a chevron/value. */
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  disabled?: boolean;
};

export function SettingsRow({
  label,
  hint,
  value,
  onPress,
  switchValue,
  onSwitchChange,
  disabled = false,
}: SettingsRowProps) {
  const theme = useTheme();
  const isSwitch = typeof switchValue === 'boolean';

  const body = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="bodyStrong">{label}</Text>
        {hint ? (
          <Text variant="caption" color="textMuted">
            {hint}
          </Text>
        ) : null}
      </View>

      {isSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          disabled={disabled}
          trackColor={{ true: theme.colors.primary, false: theme.colors.border }}
        />
      ) : value ? (
        <Text variant="body" color="textMuted">
          {value}
        </Text>
      ) : null}
    </View>
  );

  if (isSwitch || !onPress) {
    return body;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: pressed ? theme.colors.surfaceElevated : 'transparent',
      })}
    >
      {body}
    </Pressable>
  );
}
