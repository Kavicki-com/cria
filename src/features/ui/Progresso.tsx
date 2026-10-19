import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Text } from '@/core/components';
import { useTheme } from '@/core/theme';

/** The business card's bar: 8 tall, track `track`, fill `primary`. */
export function BarraProgresso({ fracao }: { fracao: number }) {
  const theme = useTheme();
  const largura = `${Math.round(Math.min(1, Math.max(0, fracao)) * 100)}%` as const;
  return (
    <View
      style={{
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.track,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          width: largura,
          height: '100%',
          borderRadius: 4,
          backgroundColor: theme.colors.primary,
        }}
      />
    </View>
  );
}

export type AnelProgressoProps = {
  /** 0–1. */
  fracao: number;
  size: number;
  espessura: number;
  /** Text in the middle (the hub's "68%"); none on the small rings of the list. */
  rotulo?: string;
  /** Already-translated description for screen readers ("68% concluído"). */
  accessibilityLabel?: string;
  /** The hole's colour: the hub draws it on the background, the rows on a card. */
  centro?: string;
};

/** Ring from the hub (64) and its rows (36): a conic fill drawn as an SVG arc. */
export function AnelProgresso({
  fracao,
  size,
  espessura,
  rotulo,
  accessibilityLabel,
  centro,
}: AnelProgressoProps) {
  const theme = useTheme();
  const raio = (size - espessura) / 2;
  const circunferencia = 2 * Math.PI * raio;
  const f = Math.min(1, Math.max(0, fracao));

  return (
    <View
      accessible={accessibilityLabel ? true : undefined}
      accessibilityRole={accessibilityLabel ? 'image' : undefined}
      accessibilityLabel={accessibilityLabel}
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
    >
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        {centro ? <Circle cx={size / 2} cy={size / 2} r={raio} fill={centro} /> : null}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={raio}
          stroke={theme.colors.border}
          strokeWidth={espessura}
          fill="none"
        />
        {f > 0 ? (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={raio}
            stroke={theme.colors.primary}
            strokeWidth={espessura}
            fill="none"
            strokeDasharray={`${circunferencia * f} ${circunferencia}`}
            // Starts at 12 o'clock, like the design's conic-gradient.
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        ) : null}
      </Svg>
      {rotulo ? (
        <Text variant="subheading" style={{ fontSize: 16, lineHeight: 20 }}>
          {rotulo}
        </Text>
      ) : null}
    </View>
  );
}

export type BarraSegmentadaProps = {
  total: number;
  /** 0-based index of the current question, drawn in goiaba. */
  atual: number;
  /** Which segments are done (blue). */
  feitos: readonly boolean[];
  /** Already-translated "Pergunta 3 de 9". */
  accessibilityLabel: string;
};

/** The form's top bar: one segment per question, goiaba = current. */
export function BarraSegmentada({
  total,
  atual,
  feitos,
  accessibilityLabel,
}: BarraSegmentadaProps) {
  const theme = useTheme();
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      style={{ flexDirection: 'row', gap: 4 }}
    >
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: 6,
            borderRadius: 3,
            backgroundColor:
              i === atual
                ? theme.colors.accent
                : feitos[i]
                  ? theme.colors.primary
                  : theme.colors.border,
          }}
        />
      ))}
    </View>
  );
}
