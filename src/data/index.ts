/**
 * The app's data layer: a local SQLite database of business plans.
 *
 * The unlock is NOT here: it is the kit's entitlement flag in MMKV, the one
 * thing that decides whether the app is paid for, and holding it twice would
 * be two sources of truth.
 *
 * The barrel exports implementations; the implementations never import back
 * through it (invariant 2).
 */
export { getDatabase, isDatabaseAvailable } from './db';
export * from './types';
export { assinarMudancas, versaoDosDados } from './mudancas';
export * from './negociosRepository';
export * from './respostasRepository';
export * from './swotRepository';
export * from './numerosRepository';
export * from './tarefasRepository';
