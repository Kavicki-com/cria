import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../theme';

export type ScreenProps = PropsWithChildren<{
  scroll?: boolean;
  padded?: boolean;
  /** Adds the bottom safe-area inset. Turn off inside tab screens. */
  edgeToEdgeBottom?: boolean;
  style?: ViewStyle;
}>;

/** Themed page container with safe-area handling. */
export function Screen({
  children,
  scroll = false,
  padded = true,
  edgeToEdgeBottom = false,
  style,
}: ScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const content: ViewStyle = {
    padding: padded ? theme.spacing.lg : 0,
    paddingBottom: (padded ? theme.spacing.lg : 0) + (edgeToEdgeBottom ? insets.bottom : 0),
    gap: theme.spacing.lg,
  };

  if (scroll) {
    return (
      <ScrollView
        style={[styles.fill, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={[content, style]}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View style={[styles.fill, { backgroundColor: theme.colors.background }, content, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
