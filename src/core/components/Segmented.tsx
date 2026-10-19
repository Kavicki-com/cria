import { Pressable, View } from 'react-native';

import { useTheme } from '../theme';
import { Text } from './Text';

export type SegmentedOption<T extends string> = {
  value: T;
  /** Already-translated label. */
  label: string;
};

export type SegmentedProps<T extends string> = {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Already-translated name of the group, for screen readers. */
  accessibilityLabel: string;
};

/** Segmented control from Ajustes: a track with a white thumb on the chosen option. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: SegmentedProps<T>) {
  const theme = useTheme();

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      style={{
        flexDirection: 'row',
        gap: 4,
        backgroundColor: theme.colors.surfaceElevated,
        borderRadius: theme.radius.input,
        padding: 4,
      }}
    >
      {options.map((option) => {
        const selecionado = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: selecionado }}
            onPress={() => onChange(option.value)}
            style={{
              flex: 1,
              minHeight: 44,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: theme.radius.md,
              backgroundColor: selecionado ? theme.colors.surface : 'transparent',
              shadowColor: '#18212E',
              shadowOpacity: selecionado ? 0.12 : 0,
              shadowRadius: 3,
              shadowOffset: { width: 0, height: 1 },
              elevation: selecionado ? 1 : 0,
            }}
          >
            <Text
              variant="support"
              numberOfLines={1}
              style={{
                color: selecionado ? theme.colors.text : theme.colors.textBody,
                fontFamily: selecionado ? theme.fonts.bold : theme.fonts.regular,
              }}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
