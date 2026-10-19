/**
 * Barrel only — see the note in `../notifications/index.ts` on why the
 * implementation and the hook must not re-export each other.
 */
export * from './prompt';
export { useRatingPrompt, type UseRatingPrompt } from './useRatingPrompt';
