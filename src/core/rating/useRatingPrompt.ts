import { useCallback, useEffect } from 'react';

import { useConfigStore } from '../storage/configStore';
import {
  DEFAULT_RATING_POLICY,
  disableRatingPrompt,
  maybeRequestRating,
  requestRating,
  type RatingOutcome,
  type RatingPolicy,
} from './prompt';

export type UseRatingPrompt = {
  /** Asks now, ignoring the policy (for the Settings row). */
  rateNow: () => Promise<RatingOutcome>;
  /** Asks only if the policy allows it (for a "win" moment in a feature). */
  maybeAsk: (policy?: RatingPolicy) => Promise<RatingOutcome | 'skipped'>;
  dismissForever: () => void;
  dismissedForever: boolean;
};

/**
 * Counts one app launch. Mount it ONCE, in the root layout.
 *
 * `useRatingPrompt` used to do this itself, so every screen that showed a
 * "Rate the app" row counted a "launch" each time it mounted — opening
 * Settings five times met `minLaunches: 5` on the first day.
 */
export function useRegisterLaunch(): void {
  const registerLaunch = useConfigStore((state) => state.registerLaunch);

  useEffect(() => {
    registerLaunch();
  }, [registerLaunch]);
}

/** Exposes the prompt actions. Launches are counted by `useRegisterLaunch`. */
export function useRatingPrompt(): UseRatingPrompt {
  const dismissedForever = useConfigStore((state) => state.ratingPromptDismissedForever);

  const maybeAsk = useCallback(
    (policy: RatingPolicy = DEFAULT_RATING_POLICY) => maybeRequestRating(policy),
    [],
  );

  return {
    rateNow: requestRating,
    maybeAsk,
    dismissForever: disableRatingPrompt,
    dismissedForever,
  };
}
