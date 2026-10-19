import * as StoreReview from 'expo-store-review';
import { Linking, Platform } from 'react-native';

import { env } from '../config';
import { getConfig } from '../storage/configStore';

/**
 * Store rating prompt helper.
 *
 * Uses the native in-app review sheet when available (both stores rate-limit
 * it silently), and falls back to opening the store listing. The counters live
 * in the config store so the prompt is not shown on every launch.
 */

export type RatingPolicy = {
  /** Minimum number of app launches before prompting. */
  minLaunches: number;
  /** Minimum days between two prompts. */
  minDaysBetweenPrompts: number;
};

export const DEFAULT_RATING_POLICY: RatingPolicy = {
  minLaunches: 5,
  minDaysBetweenPrompts: 60,
};

const DAY_MS = 24 * 60 * 60 * 1000;

/** Whether the app should ask for a review right now. */
export function shouldAskForRating(policy: RatingPolicy = DEFAULT_RATING_POLICY): boolean {
  const { launchCount, lastRatingPromptAt, ratingPromptDismissedForever } = getConfig();

  if (ratingPromptDismissedForever) return false;
  if (launchCount < policy.minLaunches) return false;

  if (lastRatingPromptAt !== null) {
    const elapsedDays = (Date.now() - lastRatingPromptAt) / DAY_MS;
    if (elapsedDays < policy.minDaysBetweenPrompts) return false;
  }

  return true;
}

/** Store listing URL used when the native review sheet is unavailable. */
export function storeListingUrl(): string | null {
  if (Platform.OS === 'ios') {
    const id = env.store.iosAppStoreId;
    return id ? `https://apps.apple.com/app/id${id}?action=write-review` : null;
  }
  if (Platform.OS === 'android') {
    const pkg = env.store.androidPackageName;
    return pkg ? `https://play.google.com/store/apps/details?id=${pkg}` : null;
  }
  return null;
}

export type RatingOutcome = 'requested' | 'store-opened' | 'unavailable' | 'not-configured';

/**
 * Asks for a review now, regardless of the policy. Use it behind an explicit
 * "Rate the app" action in Settings.
 */
export async function requestRating(): Promise<RatingOutcome> {
  getConfig().markRatingPromptShown();

  try {
    if ((await StoreReview.isAvailableAsync()) && (await StoreReview.hasAction())) {
      await StoreReview.requestReview();
      return 'requested';
    }
  } catch {
    // Fall through to the store listing.
  }

  // No store id in .env.local means there is nothing to open — a configuration
  // gap, not a device limitation. The two need different copy, or the user goes
  // looking for a problem on the phone.
  const url = StoreReview.storeUrl() ?? storeListingUrl();
  if (!url) return 'not-configured';

  try {
    await Linking.openURL(url);
    return 'store-opened';
  } catch {
    return 'unavailable';
  }
}

/** Runs the prompt only when the policy allows it. Call after a "win" moment. */
export async function maybeRequestRating(
  policy: RatingPolicy = DEFAULT_RATING_POLICY,
): Promise<RatingOutcome | 'skipped'> {
  if (!shouldAskForRating(policy)) return 'skipped';
  return requestRating();
}

/** Stops asking forever, for a "Don't ask again" control. */
export function disableRatingPrompt(): void {
  getConfig().dismissRatingPromptForever();
}
