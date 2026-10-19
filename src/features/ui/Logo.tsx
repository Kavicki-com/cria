import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type LogoProps = {
  size?: number;
  /** Already-translated label; omit when the logo sits next to the app name. */
  accessibilityLabel?: string;
};

/**
 * Logo B ("degraus"), from design/Logo: a rounded blue square, white steps
 * climbing to the goiaba dot of the goal. Same colours in both themes — it is
 * the brand, not a surface.
 */
export function Logo({ size = 32, accessibilityLabel }: LogoProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      accessible={Boolean(accessibilityLabel)}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityLabel ? 'image' : undefined}
    >
      <Rect width={64} height={64} rx={18} fill="#1F4F8F" />
      <Path
        d="M15 47h11V37h11V27h11"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={4.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={48} cy={17} r={5.5} fill="#EF6F7A" />
    </Svg>
  );
}

/** The steps alone, on no square (the empty state's dashed page). */
export function Degraus({ size = 56, cor }: { size?: number; cor: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Path
        d="M15 47h11V37h11V27h11"
        fill="none"
        stroke={cor}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={48} cy={17} r={5} fill="#EF6F7A" />
    </Svg>
  );
}
