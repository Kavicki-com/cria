import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { reportShareFailure, type ShareOutcome } from './types';

/**
 * Optional module: render HTML to a PDF file and share or print it.
 *
 * The caller builds the HTML, so all copy inside the document also comes from
 * the translation files.
 */

export type SharePdfOptions = {
  /** Full HTML document. Build it from already-translated strings. */
  html: string;
  /** Already-translated share-sheet title (Android). */
  dialogTitle?: string;
};

/** Renders the HTML to a temporary PDF and opens the share sheet. */
export async function sharePdf({ html, dialogTitle }: SharePdfOptions): Promise<ShareOutcome> {
  try {
    if (!(await Sharing.isAvailableAsync())) {
      return reportShareFailure('sharePdf', { status: 'unavailable', reason: 'sharing' });
    }

    const { uri } = await Print.printToFileAsync({ html });

    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      UTI: 'com.adobe.pdf',
      dialogTitle,
    });

    return { status: 'shared' };
  } catch (error) {
    return reportShareFailure('sharePdf', {
      status: 'error',
      detail: error instanceof Error ? error.message : undefined,
    });
  }
}

/** Sends the HTML straight to the system print dialog. */
export async function printHtml(html: string): Promise<ShareOutcome> {
  try {
    await Print.printAsync({ html });
    return { status: 'shared' };
  } catch (error) {
    return reportShareFailure('printHtml', {
      status: 'error',
      detail: error instanceof Error ? error.message : undefined,
    });
  }
}
