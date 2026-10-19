import Ionicons from '@expo/vector-icons/Ionicons';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Text } from '../components';
import type { TranslationKey } from '../i18n';
import { useTranslation } from '../i18n/useTranslation';
import { useTheme } from '../theme';

/**
 * Simple, skippable onboarding.
 *
 * Slides come from the `onboarding.*` translation scope. To add or remove a
 * slide, edit `SLIDES` here and the matching keys in `locales/*.json`.
 */

type Slide = {
  titleKey: TranslationKey;
  bodyKey: TranslationKey;
  icon: keyof typeof Ionicons.glyphMap;
};

const SLIDES: readonly Slide[] = [
  {
    titleKey: 'onboarding.slide1Title',
    bodyKey: 'onboarding.slide1Body',
    icon: 'hand-left-outline',
  },
  {
    titleKey: 'onboarding.slide2Title',
    bodyKey: 'onboarding.slide2Body',
    icon: 'cloud-offline-outline',
  },
  {
    titleKey: 'onboarding.slide3Title',
    bodyKey: 'onboarding.slide3Body',
    icon: 'lock-open-outline',
  },
];

export type OnboardingProps = {
  /** Called on "skip" and after the last slide. */
  onDone: () => void;
};

export function Onboarding({ onDone }: OnboardingProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);

  const isLast = index === SLIDES.length - 1;

  function goTo(next: number) {
    setIndex(next);
    scrollRef.current?.scrollTo({ x: next * width, animated: true });
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingTop: insets.top,
        paddingBottom: insets.bottom + theme.spacing.lg,
      }}
    >
      <View style={{ alignItems: 'flex-end', paddingHorizontal: theme.spacing.lg }}>
        <Pressable accessibilityRole="button" onPress={onDone} hitSlop={12}>
          <Text variant="bodyStrong" color="primary">
            {t('common.skip')}
          </Text>
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(event) => {
          const page = Math.round(event.nativeEvent.contentOffset.x / width);
          setIndex(page);
        }}
        style={{ flex: 1 }}
      >
        {SLIDES.map((slide) => (
          <View
            key={slide.titleKey}
            style={{
              width,
              paddingHorizontal: theme.spacing.xl,
              justifyContent: 'center',
              alignItems: 'center',
              gap: theme.spacing.lg,
            }}
          >
            <Ionicons name={slide.icon} size={64} color={theme.colors.primary} />
            <Text variant="display" center>
              {t(slide.titleKey)}
            </Text>
            <Text color="textMuted" center>
              {t(slide.bodyKey)}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={{ paddingHorizontal: theme.spacing.lg, gap: theme.spacing.lg }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: theme.spacing.sm }}>
          {SLIDES.map((slide, slideIndex) => (
            <View
              key={slide.titleKey}
              style={{
                width: slideIndex === index ? 22 : 8,
                height: 8,
                borderRadius: theme.radius.pill,
                backgroundColor: slideIndex === index ? theme.colors.primary : theme.colors.border,
              }}
            />
          ))}
        </View>

        <Text variant="caption" color="textMuted" center>
          {t('onboarding.stepLabel', { current: index + 1, total: SLIDES.length })}
        </Text>

        <Button
          label={isLast ? t('common.start') : t('common.next')}
          onPress={() => (isLast ? onDone() : goTo(index + 1))}
          testID="onboarding-next"
        />
      </View>
    </View>
  );
}
