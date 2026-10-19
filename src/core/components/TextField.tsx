import { forwardRef, useState } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';

import { useTheme } from '../theme';
import { Text } from './Text';

export type TextFieldProps = Omit<TextInputProps, 'style' | 'placeholderTextColor'> & {
  /** Already-translated label, shown above the field. Omit when the screen titles it. */
  label?: string;
  /** Already-translated hint under the field. */
  hint?: string;
  /** Already-translated error; replaces the hint and turns the border red. */
  error?: string | null;
  /** Digits line up (amounts). */
  tabular?: boolean;
  /** A prefix shown inside the field, before the value ("R$"). */
  prefix?: string;
};

/**
 * Answer field from the handoff: 2 px primary border while focused, 1 px
 * #D6CFC3 at rest, radius 14, text Roboto 17/1.5.
 *
 * The focused border is thicker, so the padding shrinks by the same 1 px —
 * otherwise the text would jump on every focus change.
 */
export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, hint, error, tabular, prefix, multiline, onFocus, onBlur, ...rest },
  ref,
) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  const borda = focused || error ? 2 : 1;
  const corBorda = error
    ? theme.colors.danger
    : focused
      ? theme.colors.primary
      : theme.colors.borderInput;

  return (
    <View style={{ gap: 8 }}>
      {label ? (
        <Text variant="support" style={{ fontFamily: theme.fonts.bold, color: theme.colors.text }}>
          {label}
        </Text>
      ) : null}
      <View
        style={{
          flexDirection: 'row',
          alignItems: multiline ? 'flex-start' : 'center',
          minHeight: multiline ? 112 : 54,
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.input,
          borderWidth: borda,
          borderColor: corBorda,
          paddingHorizontal: 16 - borda,
          paddingVertical: multiline ? 14 - borda : 0,
          gap: 6,
        }}
      >
        {prefix ? (
          <Text variant="body" color="textMuted" style={{ fontFamily: theme.fonts.medium }}>
            {prefix}
          </Text>
        ) : null}
        <TextInput
          ref={ref}
          maxFontSizeMultiplier={2}
          {...rest}
          multiline={multiline}
          accessibilityLabel={rest.accessibilityLabel ?? label}
          placeholderTextColor={theme.colors.textFaint}
          selectionColor={theme.colors.primary}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          style={{
            flex: 1,
            padding: 0,
            paddingVertical: multiline ? 0 : 12,
            color: theme.colors.text,
            fontFamily: theme.fonts.regular,
            fontSize: 17,
            lineHeight: multiline ? 25 : undefined,
            textAlignVertical: multiline ? 'top' : 'center',
            fontVariant: tabular ? ['tabular-nums'] : undefined,
          }}
        />
      </View>
      {error ? (
        <Text variant="caption" color="danger" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" color="textMuted" style={{ fontSize: 13 }}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
});
