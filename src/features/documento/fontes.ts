import { fontFiles, fonts } from '@/core/theme';

import { lerAssetBase64 } from './arquivos';

/**
 * The fonts as `@font-face` with data URIs, for the print WebView — which
 * cannot see the fonts the app registered with expo-font. Poppins 600 for
 * titles, Roboto 400/500/700 for text, the same files the app uses.
 *
 * Read once per session (≈ 0,9 MB of base64) and kept in memory.
 */
const FACES: { familia: string; peso: number; chave: keyof typeof fontFiles }[] = [
  { familia: 'Poppins', peso: 600, chave: fonts.display },
  { familia: 'Roboto', peso: 400, chave: fonts.regular },
  { familia: 'Roboto', peso: 500, chave: fonts.medium },
  { familia: 'Roboto', peso: 700, chave: fonts.bold },
];

let cache: string | undefined;

/** CSS with the embedded fonts; empty where they cannot be read (the PDF then uses system fonts). */
export async function fontesCss(): Promise<string> {
  if (cache !== undefined) return cache;
  const partes = await Promise.all(
    FACES.map(async ({ familia, peso, chave }) => {
      const base64 = await lerAssetBase64(fontFiles[chave] as number);
      return base64
        ? `@font-face{font-family:'${familia}';font-weight:${peso};font-style:normal;src:url(data:font/ttf;base64,${base64}) format('truetype');}`
        : '';
    }),
  );
  const css = partes.join('\n');
  // Only a complete set is cached: a transient failure retries next time.
  if (partes.every(Boolean)) cache = css;
  return css;
}
