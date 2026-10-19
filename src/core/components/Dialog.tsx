import { useEffect, useRef, type PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../theme';

export type DialogProps = PropsWithChildren<{
  visible: boolean;
  /** Back button / tap outside. Pass the "cancel" action — never the risky one. */
  onDismiss: () => void;
  /** Bottom sheet instead of a centred card. */
  sheet?: boolean;
  /**
   * Runs once the dialog has finished closing. Open the next dialog or
   * navigate from here, not right after hiding this one: on iOS a modal
   * presented while another is still dismissing silently fails to appear.
   */
  onFechado?: () => void;
}>;

/**
 * Centred dialog or bottom sheet over the scrim (handoff: radius 28, white
 * card on `scrim`). Content and buttons come from the caller.
 */
export function Dialog({ visible, onDismiss, sheet = false, onFechado, children }: DialogProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  // iOS reports the end of the dismissal through Modal's `onDismiss`; Android
  // has no such event (and no dismiss animation to wait for), so it is
  // signalled when `visible` turns false.
  const estavaVisivel = useRef(visible);
  useEffect(() => {
    if (Platform.OS !== 'ios' && estavaVisivel.current && !visible) onFechado?.();
    estavaVisivel.current = visible;
  }, [visible, onFechado]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType={sheet ? 'slide' : 'fade'}
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onDismiss}
      onDismiss={Platform.OS === 'ios' ? onFechado : undefined}
    >
      <KeyboardAvoidingView
        behavior="padding"
        style={{
          flex: 1,
          justifyContent: sheet ? 'flex-end' : 'center',
          // Horizontal only: with behavior="padding" KeyboardAvoidingView
          // replaces paddingBottom with the keyboard height, which left a
          // centred dialog 12 pt off-centre with a vertical padding here.
          paddingHorizontal: sheet ? 0 : 24,
        }}
      >
        <Pressable
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          onPress={onDismiss}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: theme.colors.scrim,
          }}
        />
        <View
          accessibilityViewIsModal
          style={
            sheet
              ? {
                  backgroundColor: theme.colors.background,
                  borderTopLeftRadius: theme.radius.sheet,
                  borderTopRightRadius: theme.radius.sheet,
                  paddingTop: 10,
                  paddingHorizontal: 20,
                  paddingBottom: insets.bottom + 16,
                  gap: 14,
                }
              : {
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.radius.sheet,
                  paddingTop: 28,
                  paddingHorizontal: 22,
                  paddingBottom: 18,
                  gap: 12,
                }
          }
        >
          {sheet ? (
            <View
              style={{
                alignSelf: 'center',
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: theme.colors.borderInput,
              }}
            />
          ) : null}
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
