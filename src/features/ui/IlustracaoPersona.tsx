import Svg, { Circle, ClipPath, Defs, Ellipse, G, Path, Rect } from 'react-native-svg';

import type { Ilustracao } from '../quadros/definicoes';

/**
 * The persona's own illustrations, drawn for Cria (design Persona, sc-if
 * `ehMulher` / `ehHomem`). SVG inside the app: no licence question. The PDF
 * template carries the same paths as markup (`documento/ilustracoes.ts`).
 */
export function IlustracaoPersona({
  tipo,
  size,
  accessibilityLabel,
}: {
  tipo: Ilustracao;
  size: number;
  accessibilityLabel?: string;
}) {
  const id = `persona-${tipo}`;
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      accessible={accessibilityLabel ? true : undefined}
      accessibilityRole={accessibilityLabel ? 'image' : undefined}
      accessibilityLabel={accessibilityLabel}
    >
      <Defs>
        <ClipPath id={id}>
          <Circle cx={32} cy={32} r={32} />
        </ClipPath>
      </Defs>
      <G clipPath={`url(#${id})`}>{tipo === 'homem' ? <Homem /> : <Mulher />}</G>
    </Svg>
  );
}

function Mulher() {
  return (
    <>
      <Rect width={64} height={64} fill="#FCE3E5" />
      <Path d="M13 40c0-17 8-27 19-27s19 10 19 27v14H13z" fill="#2B1D16" />
      <Path d="M8 66c0-13 11-20 24-20s24 7 24 20z" fill="#E4ECF7" />
      <Path d="M24 46c2 4 5 6 8 6s6-2 8-6" fill="none" stroke="#B8C9E2" strokeWidth={2} />
      <Rect x={27} y={37} width={10} height={11} rx={4} fill="#B97A57" />
      <Ellipse cx={32} cy={29} rx={10.5} ry={12.5} fill="#C98B67" />
      <Path
        d="M21 28c1-10 6-14 11.5-14 6.5 0 10.5 5 11 12-5-1-9-4-11.5-8-2 5-6 8.5-11 10z"
        fill="#2B1D16"
      />
      <Circle cx={28} cy={30} r={1.3} fill="#2B1D16" />
      <Circle cx={36} cy={30} r={1.3} fill="#2B1D16" />
      <Path
        d="M28.5 35.5c2 1.6 5 1.6 7 0"
        fill="none"
        stroke="#7A3E2A"
        strokeWidth={1.4}
        strokeLinecap="round"
      />
      <Circle cx={42.5} cy={33} r={1.6} fill="#EF6F7A" />
    </>
  );
}

function Homem() {
  return (
    <>
      <Rect width={64} height={64} fill="#E4ECF7" />
      <Path d="M7 66c0-13 11-21 25-21s25 8 25 21z" fill="#1F4F8F" />
      <Path d="M26 45l6 7 6-7" fill="#FFFFFF" />
      <Rect x={27} y={37} width={10} height={11} rx={4} fill="#8E5A3E" />
      <Ellipse cx={21.5} cy={30} rx={2} ry={3} fill="#A86B4C" />
      <Ellipse cx={42.5} cy={30} rx={2} ry={3} fill="#A86B4C" />
      <Ellipse cx={32} cy={29.5} rx={10.5} ry={12.5} fill="#A86B4C" />
      <Path
        d="M22.5 31c.5 8 4.5 11.5 9.5 11.5s9-3.5 9.5-11.5c-1.6 3.4-4.6 5.4-9.5 5.4s-7.9-2-9.5-5.4z"
        fill="#1E1612"
      />
      <Path
        d="M21.5 27c-.5-9 4.5-14.5 10.5-14.5S43 18 42.5 27c-1.6-3.6-3.6-6-6.5-6.6-2 1.6-5.6 2.4-9.6 1.6-2.4 1-4 2.8-4.9 5z"
        fill="#1E1612"
      />
      <Circle cx={28} cy={29.5} r={1.3} fill="#1E1612" />
      <Circle cx={36} cy={29.5} r={1.3} fill="#1E1612" />
      <Path
        d="M29 36.4c1.8 1.2 4.2 1.2 6 0"
        fill="none"
        stroke="#F3E3D6"
        strokeWidth={1.4}
        strokeLinecap="round"
      />
    </>
  );
}
