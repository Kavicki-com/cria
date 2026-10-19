import { router, type Href } from 'expo-router';

/**
 * `router.push` / `router.replace` that ignore a repeat within a short window.
 *
 * A double tap on a list row fires `onPress` twice before the first screen
 * has finished appearing, and each call pushes: the user lands on the same
 * screen twice and has to go back twice (reported on a device, 2026-10-06,
 * tapping a customer on Home). Disabling each button until its screen opens
 * would have to be repeated at every call site; one window here covers them
 * all, the paywall included.
 *
 * 600 ms covers a double tap and a native stack transition, and is short
 * enough that a deliberate second navigation is never held back.
 */
const JANELA_MS = 600;

let ultimaNavegacao = 0;

function liberada(): boolean {
  const agora = Date.now();
  if (agora - ultimaNavegacao < JANELA_MS) return false;
  ultimaNavegacao = agora;
  return true;
}

export function pushOnce(href: Href): void {
  if (liberada()) router.push(href);
}

export function replaceOnce(href: Href): void {
  if (liberada()) router.replace(href);
}

/**
 * Back to a screen already in the stack (usually the tabs), popping what is
 * above it. `router.navigate` and `router.replace` from a root-stack screen
 * add a SECOND copy of the tab navigator instead, so Android back returned to
 * the screen the user had just left. `dismissTo` pops to the existing route.
 */
export function dismissToOnce(href: Href): void {
  if (liberada()) router.dismissTo(href);
}
