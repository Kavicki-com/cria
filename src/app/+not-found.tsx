import { Button, Screen, Text } from '@/core/components';
import { useTranslation } from '@/core/i18n/useTranslation';
import { replaceOnce } from '@/core/navigation';

export default function NotFoundRoute() {
  const { t } = useTranslation();

  return (
    <Screen contentStyle={{ justifyContent: 'center' }}>
      <Text variant="title" center accessibilityRole="header">
        {t('notFound.title')}
      </Text>
      <Text color="textMuted" center>
        {t('notFound.body')}
      </Text>
      <Button label={t('notFound.goHome')} onPress={() => replaceOnce('/')} />
    </Screen>
  );
}
