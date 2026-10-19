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

/** The share sheet — which on iOS also offers "Salvar em Arquivos". */
export async function compartilharPdf(uri: string, titulo: string): Promise<boolean> {
  try {
    if (!(await Sharing.isAvailableAsync())) return false;
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      UTI: 'com.adobe.pdf',
      dialogTitle: titulo,
    });
    return true;
  } catch {
    return false;
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
