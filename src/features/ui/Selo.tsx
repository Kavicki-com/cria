import { Badge, IconFileCheck, useBadgeColor } from '@/core/components';

/** "Plano liberado": always green (success), never red. */
export function SeloLiberado({ label }: { label: string }) {
  const cor = useBadgeColor('success');
  return (
    <Badge
      tone="success"
      label={label}
      icon={<IconFileCheck size={14} strokeWidth={2.4} color={cor} />}
    />
  );
}
