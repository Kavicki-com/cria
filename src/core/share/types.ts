/** Shared outcome type so the UI can map failures to i18n keys. */
export type ShareOutcome =
  | { status: 'shared' }
  | { status: 'cancelled' }
  | { status: 'unavailable'; reason: 'whatsapp' | 'sharing' | 'capture' }
  | { status: 'error'; detail?: string };

/**
 * Names the real cause in the Metro log during development.
 *
 * Share and print failures surface to the user as one generic line, which is
 * right for production and useless while building. The underlying error is the
 * only thing that says whether a native module is missing, a permission was
 * refused or the HTML was bad.
 */
export function reportShareFailure(where: string, outcome: ShareOutcome): ShareOutcome {
  if (__DEV__ && (outcome.status === 'error' || outcome.status === 'unavailable')) {
    const reason = outcome.status === 'unavailable' ? outcome.reason : outcome.detail;
    console.warn(`[core/share] ${where} failed: ${outcome.status}`, reason ?? '(no detail)');
  }
  return outcome;
}
