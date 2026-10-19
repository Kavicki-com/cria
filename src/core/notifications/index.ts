/**
 * Barrel only.
 *
 * The implementation lives in `local.ts` and the hook imports from there
 * directly. Re-exporting the hook from the same file that holds the
 * implementation creates a require cycle (`index -> hook -> index`), which
 * Metro allows but warns about — and a cycle can leave bindings uninitialized
 * at capture time, so the hook may close over `undefined`.
 */
export * from './local';
export {
  useNotificationPermission,
  type UseNotificationPermission,
} from './useNotificationPermission';
