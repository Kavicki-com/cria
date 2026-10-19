import Svg, { Circle, ClipPath, Defs, Ellipse, G, Path, Rect } from 'react-native-svg';

import type { Ilustracao } from '../quadros/definicoes';
import { ILUSTRACOES } from './ilustracoesDados';

/**
 * The persona's own illustrations, drawn for Cria: SVG inside the app, no
 * licence question. The shapes live in `ilustracoesDados.ts`, shared with the
 * PDF.
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
      <G clipPath={`url(#${id})`}>
        {ILUSTRACOES[tipo].map((f, i) => {
          switch (f.tipo) {
            case 'rect':
              return (
                <Rect
                  key={i}
                  x={f.x}
                  y={f.y}
                  width={f.width}
                  height={f.height}
                  rx={f.rx}
                  fill={f.fill}
                />
              );
            case 'ellipse':
              return <Ellipse key={i} cx={f.cx} cy={f.cy} rx={f.rx} ry={f.ry} fill={f.fill} />;
            case 'circle':
              return <Circle key={i} cx={f.cx} cy={f.cy} r={f.r} fill={f.fill} />;
            case 'path':
              return (
                <Path
                  key={i}
                  d={f.d}
                  fill={f.fill}
                  stroke={f.stroke}
                  strokeWidth={f.strokeWidth}
                  strokeLinecap={f.strokeLinecap}
                />
              );
          }
        })}
      </G>
    </Svg>
  );
}
