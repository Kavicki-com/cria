import { Pressable } from 'react-native';

import { useTheme } from '../theme';
import { Text } from './Text';

export type ChipProps = {
  /** Already-translated label. */
  label: string;
  selected: boolean;
  onPress: () => void;
};

/** Selectable pill (segment on Novo negócio): 2 px primary border when chosen. */
export function Chip({ label, selected, onPress }: ChipProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 44,
        justifyContent: 'center',
        paddingHorizontal: selected ? 15 : 16,
        borderRadius: theme.radius.pill,
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? theme.colors.primary : theme.colors.borderInput,
        backgroundColor: selected ? theme.colors.primarySoft : theme.colors.surface,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text
        variant="support"
        style={{
          color: selected ? theme.colors.primaryText : theme.colors.text,
          fontFamily: selected ? theme.fonts.bold : theme.fonts.regular,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
