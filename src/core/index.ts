/**
 * Public surface of the reusable core.
 *
 * App code should import from `@/core` (or a submodule such as
 * `@/core/purchases`) and never reach into internal files directly.
 */

export * from './components';
export * from './config';
export * from './i18n';
export * from './navigation';
export { useTranslation, type TranslateFn } from './i18n/useTranslation';
export * from './notifications';
export * from './purchases';
export * from './rating';
export * from './runtime';
export * from './share';
export * from './storage';
export * from './theme';
