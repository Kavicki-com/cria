import type { Ilustracao } from '../quadros/definicoes';

/**
 * The persona's two illustrations as data: the shapes of design/Persona
 * (sc-if `ehMulher` / `ehHomem`), on a 64×64 canvas clipped to a circle.
 *
 * One source for both renderers — `IlustracaoPersona` (react-native-svg) in
 * the app and `svgIlustracao` (markup) in the PDF — so the two can never
 * drift apart. Pure: the PDF tests import it.
 */

export type Forma =
  | {
      tipo: 'rect';
      x?: number;
      y?: number;
      width: number;
      height: number;
      rx?: number;
      fill: string;
    }
  | { tipo: 'ellipse'; cx: number; cy: number; rx: number; ry: number; fill: string }
  | { tipo: 'circle'; cx: number; cy: number; r: number; fill: string }
  | {
      tipo: 'path';
      d: string;
      fill: string;
      stroke?: string;
      strokeWidth?: number;
      strokeLinecap?: 'round';
    };

export const ILUSTRACOES: Record<Ilustracao, readonly Forma[]> = {
  mulher: [
    { tipo: 'rect', width: 64, height: 64, fill: '#FCE3E5' },
    { tipo: 'path', d: 'M13 40c0-17 8-27 19-27s19 10 19 27v14H13z', fill: '#2B1D16' },
    { tipo: 'path', d: 'M8 66c0-13 11-20 24-20s24 7 24 20z', fill: '#E4ECF7' },
    {
      tipo: 'path',
      d: 'M24 46c2 4 5 6 8 6s6-2 8-6',
      fill: 'none',
      stroke: '#B8C9E2',
      strokeWidth: 2,
    },
    { tipo: 'rect', x: 27, y: 37, width: 10, height: 11, rx: 4, fill: '#B97A57' },
    { tipo: 'ellipse', cx: 32, cy: 29, rx: 10.5, ry: 12.5, fill: '#C98B67' },
    {
      tipo: 'path',
      d: 'M21 28c1-10 6-14 11.5-14 6.5 0 10.5 5 11 12-5-1-9-4-11.5-8-2 5-6 8.5-11 10z',
      fill: '#2B1D16',
    },
    { tipo: 'circle', cx: 28, cy: 30, r: 1.3, fill: '#2B1D16' },
    { tipo: 'circle', cx: 36, cy: 30, r: 1.3, fill: '#2B1D16' },
    {
      tipo: 'path',
      d: 'M28.5 35.5c2 1.6 5 1.6 7 0',
      fill: 'none',
      stroke: '#7A3E2A',
      strokeWidth: 1.4,
      strokeLinecap: 'round',
    },
    { tipo: 'circle', cx: 42.5, cy: 33, r: 1.6, fill: '#EF6F7A' },
  ],
  homem: [
    { tipo: 'rect', width: 64, height: 64, fill: '#E4ECF7' },
    { tipo: 'path', d: 'M7 66c0-13 11-21 25-21s25 8 25 21z', fill: '#1F4F8F' },
    { tipo: 'path', d: 'M26 45l6 7 6-7', fill: '#FFFFFF' },
    { tipo: 'rect', x: 27, y: 37, width: 10, height: 11, rx: 4, fill: '#8E5A3E' },
    { tipo: 'ellipse', cx: 21.5, cy: 30, rx: 2, ry: 3, fill: '#A86B4C' },
    { tipo: 'ellipse', cx: 42.5, cy: 30, rx: 2, ry: 3, fill: '#A86B4C' },
    { tipo: 'ellipse', cx: 32, cy: 29.5, rx: 10.5, ry: 12.5, fill: '#A86B4C' },
    {
      tipo: 'path',
      d: 'M22.5 31c.5 8 4.5 11.5 9.5 11.5s9-3.5 9.5-11.5c-1.6 3.4-4.6 5.4-9.5 5.4s-7.9-2-9.5-5.4z',
      fill: '#1E1612',
    },
    {
      tipo: 'path',
      d: 'M21.5 27c-.5-9 4.5-14.5 10.5-14.5S43 18 42.5 27c-1.6-3.6-3.6-6-6.5-6.6-2 1.6-5.6 2.4-9.6 1.6-2.4 1-4 2.8-4.9 5z',
      fill: '#1E1612',
    },
    { tipo: 'circle', cx: 28, cy: 29.5, r: 1.3, fill: '#1E1612' },
    { tipo: 'circle', cx: 36, cy: 29.5, r: 1.3, fill: '#1E1612' },
    {
      tipo: 'path',
      d: 'M29 36.4c1.8 1.2 4.2 1.2 6 0',
      fill: 'none',
      stroke: '#F3E3D6',
      strokeWidth: 1.4,
      strokeLinecap: 'round',
    },
  ],
};

/** The illustration as SVG markup, for the PDF. */
export function svgIlustracao(tipo: Ilustracao, tamanho: number, id: string): string {
  const formas = ILUSTRACOES[tipo]
    .map((f) => {
      switch (f.tipo) {
        case 'rect':
          return `<rect x="${f.x ?? 0}" y="${f.y ?? 0}" width="${f.width}" height="${f.height}"${f.rx ? ` rx="${f.rx}"` : ''} fill="${f.fill}"/>`;
        case 'ellipse':
          return `<ellipse cx="${f.cx}" cy="${f.cy}" rx="${f.rx}" ry="${f.ry}" fill="${f.fill}"/>`;
        case 'circle':
          return `<circle cx="${f.cx}" cy="${f.cy}" r="${f.r}" fill="${f.fill}"/>`;
        case 'path':
          return `<path d="${f.d}" fill="${f.fill}"${f.stroke ? ` stroke="${f.stroke}" stroke-width="${f.strokeWidth}"` : ''}${f.strokeLinecap ? ` stroke-linecap="${f.strokeLinecap}"` : ''}/>`;
      }
    })
    .join('');
  return `<svg width="${tamanho}" height="${tamanho}" viewBox="0 0 64 64" aria-hidden="true"><defs><clipPath id="${id}"><circle cx="32" cy="32" r="32"/></clipPath></defs><g clip-path="url(#${id})">${formas}</g></svg>`;
}
