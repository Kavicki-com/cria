import { router, Stack } from 'expo-router';

import { Button, Screen, Text } from '@/core/components';
import { useTranslation } from '@/core/i18n/useTranslation';

export default function NotFoundRoute() {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ title: t('notFound.title') }} />
      <Screen style={{ justifyContent: 'center' }}>
        <Text variant="title" center>
          {t('notFound.title')}
        </Text>
        <Text color="textMuted" center>
          {t('notFound.body')}
        </Text>
        <Button label={t('notFound.goHome')} onPress={() => router.replace('/')} />
      </Screen>
    </>
  );
}
