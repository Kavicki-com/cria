import { Linking } from 'react-native';

import { reportShareFailure, type ShareOutcome } from './types';

/**
 * Optional module: share plain text through WhatsApp.
 *
 * Uses the universal `wa.me` link, so no native SDK and no extra permission is
 * needed. An app that does not share to WhatsApp simply never imports this.
 */

export type WhatsAppShare = {
  /** Already-translated message body. */
  message: string;
  /** Recipient in international format, digits only (e.g. `5511999999999`). */
  phone?: string;
};

export function buildWhatsAppUrl({ message, phone }: WhatsAppShare): string {
  const digits = phone?.replace(/\D/g, '') ?? '';
  const text = encodeURIComponent(message);
  return digits ? `https://wa.me/${digits}?text=${text}` : `https://wa.me/?text=${text}`;
}

export async function shareToWhatsApp(payload: WhatsAppShare): Promise<ShareOutcome> {
  const url = buildWhatsAppUrl(payload);

  try {
    if (!(await Linking.canOpenURL(url))) {
      return reportShareFailure('shareToWhatsApp', { status: 'unavailable', reason: 'whatsapp' });
    }
    await Linking.openURL(url);
    return { status: 'shared' };
  } catch (error) {
    return reportShareFailure('shareToWhatsApp', {
      status: 'error',
      detail: error instanceof Error ? error.message : undefined,
    });
  }
}
