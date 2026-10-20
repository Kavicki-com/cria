import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { renomearPdf } from './arquivos';

/**
 * Printing and sharing the PDF. Unlike the kit's `sharePdf` (which prints and
 * shares in one call), generating returns the file, so the "Documento pronto"
 * screen can share it, save it or open it as often as the person wants.
 * Worth taking back to the kit (`core/share/pdf.ts`).
 */

/** A4 in points: expo-print defaults to US Letter. */
const A4 = { width: 595, height: 842 } as const;

export type ResultadoPdf = { status: 'ok'; uri: string } | { status: 'erro'; detalhe?: string };

export async function gerarPdf(html: string, nomeArquivo: string): Promise<ResultadoPdf> {
  try {
    const { uri } = await Print.printToFileAsync({ html, ...A4 });
    return { status: 'ok', uri: await renomearPdf(uri, nomeArquivo) };
  } catch (error) {
    return { status: 'erro', detalhe: error instanceof Error ? error.message : undefined };
  }
}

export type ResultadoCompartilhar = { ok: true } | { ok: false; detalhe?: string };

/**
 * The share sheet — which on iOS also offers "Salvar em Arquivos". A failure
 * comes back with the native message, so the screen can say the sheet did
 * not open instead of the button silently doing nothing.
 */
export async function compartilharPdf(uri: string, titulo: string): Promise<ResultadoCompartilhar> {
  try {
    if (!(await Sharing.isAvailableAsync())) return { ok: false, detalhe: 'unavailable' };
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      UTI: 'com.adobe.pdf',
      dialogTitle: titulo,
    });
    return { ok: true };
  } catch (error) {
    return { ok: false, detalhe: error instanceof Error ? error.message : undefined };
  }
}

/** The system's print preview, which shows the PDF. */
export async function abrirPdf(uri: string): Promise<boolean> {
  try {
    await Print.printAsync({ uri });
    return true;
  } catch {
    return false;
  }
}
