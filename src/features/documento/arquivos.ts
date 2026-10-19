// `import type` is erased at compile time, so it emits no runtime require.
import type * as AssetModule from 'expo-asset';
import type * as FileSystemModule from 'expo-file-system';

/**
 * Files for the PDF: reading the bundled font files as base64, and giving the
 * printed PDF its name.
 *
 * The single file allowed to load `expo-file-system` and `expo-asset` at
 * runtime (invariant 1, `scripts/check-invariants.mjs`). Both resolve their
 * native module at top level —
 *   expo-file-system/src/ExpoFileSystem.ts: requireNativeModule('FileSystem')
 *   expo-asset/build/ExpoAsset.js: requireNativeModule('ExpoAsset')
 * — so a static import throws wherever they are not compiled in. Every
 * function below degrades (returns null) instead of throwing.
 */

type FileSystem = typeof FileSystemModule;
type Asset = typeof AssetModule;

let fs: FileSystem | null | undefined;
let asset: Asset | null | undefined;

function carregarFs(): FileSystem | null {
  if (fs !== undefined) return fs;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    fs = require('expo-file-system') as FileSystem;
  } catch {
    fs = null;
  }
  return fs;
}

function carregarAsset(): Asset | null {
  if (asset !== undefined) return asset;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    asset = require('expo-asset') as Asset;
  } catch {
    asset = null;
  }
  return asset;
}

/** A bundled asset (e.g. a font file from `require`) as base64, or null. */
export async function lerAssetBase64(modulo: number): Promise<string | null> {
  const a = carregarAsset();
  const f = carregarFs();
  if (!a || !f) return null;
  try {
    const recurso = await a.Asset.fromModule(modulo).downloadAsync();
    if (!recurso.localUri) return null;
    return await new f.File(recurso.localUri).base64();
  } catch {
    return null;
  }
}

/**
 * Moves the printed PDF (a random name in the cache) to `nome` in the cache,
 * replacing an older copy, so the share sheet shows "Plano-Lanches-da-Vila.pdf".
 * Returns the new URI, or the original one if the move is not possible.
 */
export async function renomearPdf(uri: string, nome: string): Promise<string> {
  const f = carregarFs();
  if (!f) return uri;
  try {
    const destino = new f.File(f.Paths.cache, nome);
    if (destino.exists) destino.delete();
    const origem = new f.File(uri);
    await origem.move(destino);
    return destino.uri;
  } catch {
    return uri;
  }
}
