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

/** Counts this launch once and exposes the prompt actions. */
export function useRatingPrompt(): UseRatingPrompt {
  const registerLaunch = useConfigStore((state) => state.registerLaunch);
  const dismissedForever = useConfigStore((state) => state.ratingPromptDismissedForever);

  useEffect(() => {
    registerLaunch();
  }, [registerLaunch]);

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
