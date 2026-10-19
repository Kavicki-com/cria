import * as Sharing from 'expo-sharing';
import { captureRef, releaseCapture } from 'react-native-view-shot';

import { hasNativeModule } from '../runtime';
import { reportShareFailure, type ShareOutcome } from './types';

/**
 * Optional module: turn a rendered view into a PNG/JPG and hand it to the OS
 * share sheet. Wrap the view you want to export in a plain `View` and pass its
 * ref here.
 *
 * `react-native-view-shot` resolves to `undefined` where its native module is
 * absent (Expo Go) instead of throwing on import, so the probe below turns that
 * into a clean `unavailable` outcome rather than a crash at capture time.
 */

/** True when the view-shot native module is linked into this runtime. */
export function isViewShotAvailable(): boolean {
  return hasNativeModule('RNViewShot');
}

/** Anything `captureRef` accepts: a ref, a node handle or a component. */
export type CaptureTarget = Parameters<typeof captureRef>[0];

export type ShareImageOptions = {
  /** Already-translated share-sheet title (Android). */
  dialogTitle?: string;
  format?: 'png' | 'jpg';
  quality?: number;
};

/** Captures `viewRef` and opens the share sheet with the resulting file. */
export async function shareViewAsImage(
  viewRef: CaptureTarget,
  options: ShareImageOptions = {},
): Promise<ShareOutcome> {
  const { format = 'png', quality = 1, dialogTitle } = options;
  let uri: string | undefined;

  try {
    if (!isViewShotAvailable()) {
      return reportShareFailure('shareViewAsImage', { status: 'unavailable', reason: 'capture' });
    }
    if (!(await Sharing.isAvailableAsync())) {
      return reportShareFailure('shareViewAsImage', { status: 'unavailable', reason: 'sharing' });
    }

    uri = await captureRef(viewRef, { format, quality, result: 'tmpfile' });

    await Sharing.shareAsync(uri, {
      mimeType: format === 'png' ? 'image/png' : 'image/jpeg',
      UTI: format === 'png' ? 'public.png' : 'public.jpeg',
      dialogTitle,
    });

    return { status: 'shared' };
  } catch (error) {
    return reportShareFailure('shareViewAsImage', {
      status: 'error',
      detail: error instanceof Error ? error.message : undefined,
    });
  } finally {
    if (uri) releaseCapture(uri);
  }
}
