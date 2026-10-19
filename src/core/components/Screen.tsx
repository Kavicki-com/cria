import type { PropsWithChildren, ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../theme';

/**
 * The screens were drawn at 390 pt. On an iPad the content keeps a phone-like
 * column, centred, instead of stretching a form across 1,000 pt.
 */
export const LARGURA_MAXIMA = 600;

export type ScreenProps = PropsWithChildren<{
  /** Scrolls the content. The footer, if any, stays put below it. */
  scroll?: boolean;
  /** Top bar (back/close, actions), outside the scroll. */
  header?: ReactNode;
  /** Sticky bottom area (the CTA), above the home indicator. */
  footer?: ReactNode;
  /** Gap between the children. */
  gap?: number;
  /** Background other than the theme's (the PDF-preview paper, a dialog). */
  backgroundColor?: string;
  contentStyle?: StyleProp<ViewStyle>;
}>;

/**
 * Themed page from the handoff: 20 pt side padding, content below the status
 * bar, an optional sticky footer for the CTA.
 *
 * The screens draw their own top bar (the handoff has no native header), so
 * every route registers with `headerShown: false`.
 */
export function Screen({
  children,
  scroll = false,
  header,
  footer,
  gap,
  backgroundColor,
  contentStyle,
}: ScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const fundo = backgroundColor ?? theme.colors.background;

  const conteudo: ViewStyle = {
    width: '100%',
    maxWidth: LARGURA_MAXIMA,
    alignSelf: 'center',
    paddingHorizontal: theme.spacing.tela,
    paddingTop: header ? 0 : insets.top + 12,
    paddingBottom: footer ? theme.spacing.lg : insets.bottom + theme.spacing.xl,
    gap: gap ?? theme.spacing.lg + 4,
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={[styles.fill, { backgroundColor: fundo }]}>
      {header ? (
        <View
          style={{
            width: '100%',
            maxWidth: LARGURA_MAXIMA,
            alignSelf: 'center',
            paddingTop: insets.top + 4,
            paddingHorizontal: theme.spacing.tela - 10,
            minHeight: insets.top + 48,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
          }}
        >
          {header}
        </View>
      ) : null}

      {scroll ? (
        <ScrollView
          style={styles.fill}
          contentContainerStyle={[conteudo, { flexGrow: 1 }, contentStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.fill, conteudo, contentStyle]}>{children}</View>
      )}

      {footer ? (
        <View
          style={{
            width: '100%',
            maxWidth: LARGURA_MAXIMA,
            alignSelf: 'center',
            paddingHorizontal: theme.spacing.tela,
            paddingTop: theme.spacing.sm,
            // No KeyboardAvoidingView padding here: with behavior="padding" it
            // replaces paddingBottom on itself, so the inset goes on this view.
            paddingBottom: insets.bottom + theme.spacing.md,
            gap: theme.spacing.md,
          }}
        >
          {footer}
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
