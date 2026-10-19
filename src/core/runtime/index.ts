import Constants from 'expo-constants';
import { NativeModules } from 'react-native';

/**
 * Runtime capability probes.
 *
 * The kit targets dev builds, but it must also load inside Expo Go so the
 * frontend can be iterated without a native build. Rather than branching on
 * "am I in Expo Go?", every guard here asks "is this native module actually
 * present?" — that is the condition we care about, and it covers web, unit
 * tests and future runtimes for free.
 *
 * Note that `Constants.executionEnvironment === 'storeClient'` is NOT an Expo
 * Go check: it is also true for a dev build made with expo-dev-client.
 */

/** True when a bridge/TurboModule native module is registered. */
export function hasNativeModule(name: string): boolean {
  return NativeModules[name] != null;
}

/**
 * Cosmetic only — used to explain to a developer why a feature is inert.
 * Functional gating must use the capability probes, never this.
 *
 * `appOwnership` is deprecated but remains the only field that separates Expo
 * Go from a dev client.
 */
export function isExpoGo(): boolean {
  return Constants.appOwnership === 'expo';
}
