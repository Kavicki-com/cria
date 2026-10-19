import Purchases, {
  LOG_LEVEL,
  PURCHASES_ERROR_CODE,
  type CustomerInfo,
  type PurchasesOffering,
  type PurchasesPackage,
} from 'react-native-purchases';

import { env, isPurchasesConfigured, revenueCatApiKey } from '../config';
import { hasNativeModule } from '../runtime';

/**
 * Thin wrapper around RevenueCat for a SINGLE non-consumable unlock.
 *
 * `react-native-purchases` is a native module: it requires a dev build or a
 * store build and is absent in Expo Go. Two separate things can make billing
 * inert, and both degrade gracefully instead of throwing:
 *
 * - the native module is missing (Expo Go) → `native-unavailable`
 * - no public SDK key is set (see `.env.example`) → `not-configured`
 *
 * The SDK itself guards its import, so importing it in Expo Go is safe; only
 * the calls would throw, which is what the probe below prevents.
 */

/** Outcome of a purchase or restore attempt, mapped to i18n keys by the UI. */
export type UnlockOutcome =
  | { status: 'unlocked' }
  | { status: 'cancelled' }
  /** Android "slow" payment (boleto, cash): not unlocked until the store confirms. */
  | { status: 'pending' }
  | { status: 'not-configured' }
  | { status: 'native-unavailable' }
  | { status: 'no-offering' }
  | { status: 'nothing-to-restore' }
  | { status: 'error'; detail?: string };

let configured = false;

/** True when the RevenueCat native module is linked into this runtime. */
export function isPurchasesNativeAvailable(): boolean {
  return hasNativeModule('RNPurchases');
}

/** True when billing can actually run: native module present AND a key set. */
export function isPurchasesUsable(): boolean {
  return isPurchasesNativeAvailable() && isPurchasesConfigured();
}

/** Idempotent SDK setup. Safe to call from the root layout on every mount. */
export async function configurePurchases(): Promise<boolean> {
  if (configured) return true;
  if (!isPurchasesUsable()) return false;

  try {
    await Purchases.setLogLevel(env.isProduction ? LOG_LEVEL.ERROR : LOG_LEVEL.WARN);
    Purchases.configure({ apiKey: revenueCatApiKey() });
    configured = true;
    return true;
  } catch {
    // A linked-but-broken module should not take the app down.
    return false;
  }
}

/** Distinguishes "no native module" from "no key", for the paywall copy. */
function unusableReason(): UnlockOutcome {
  return isPurchasesNativeAvailable()
    ? { status: 'not-configured' }
    : { status: 'native-unavailable' };
}

/** True when the configured entitlement is active on this store account. */
export function hasUnlockEntitlement(info: CustomerInfo | null | undefined): boolean {
  if (!info) return false;
  return Boolean(info.entitlements.active[env.revenueCat.entitlementId]);
}

export async function fetchCustomerInfo(): Promise<CustomerInfo | null> {
  if (!(await configurePurchases())) return null;
  try {
    return await Purchases.getCustomerInfo();
  } catch {
    return null;
  }
}

/** The offering the paywall should display: the configured one, else current. */
export async function fetchUnlockOffering(): Promise<PurchasesOffering | null> {
  if (!(await configurePurchases())) return null;

  try {
    const offerings = await Purchases.getOfferings();
    const configuredId = env.revenueCat.offeringId;

    if (configuredId) {
      return offerings.all[configuredId] ?? offerings.current ?? null;
    }
    return offerings.current ?? null;
  } catch {
    return null;
  }
}

/**
 * Picks the package that represents the one-time unlock: the one matching
 * `EXPO_PUBLIC_RC_PRODUCT_ID`, else a lifetime package, else the first one.
 */
export function pickUnlockPackage(offering: PurchasesOffering | null): PurchasesPackage | null {
  if (!offering) return null;

  const packages = offering.availablePackages;
  if (packages.length === 0) return null;

  const productId = env.revenueCat.productId;
  const byProduct = productId
    ? packages.find((pkg) => pkg.product.identifier === productId)
    : undefined;

  const lifetime = packages.find((pkg) => pkg.packageType === 'LIFETIME');

  return byProduct ?? lifetime ?? packages[0] ?? null;
}

function isUserCancellation(error: unknown): boolean {
  return Boolean(
    error && typeof error === 'object' && 'userCancelled' in error
      ? (error as { userCancelled?: boolean | null }).userCancelled
      : false,
  );
}

/**
 * A purchase awaiting payment (Play's pending transactions) comes back as an
 * error. It is not a failure: the entitlement arrives later through the
 * customer-info listener, so the paywall says "em análise" instead.
 */
function isPaymentPending(error: unknown): boolean {
  return Boolean(
    error &&
    typeof error === 'object' &&
    'code' in error &&
    (error as { code?: unknown }).code === PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR,
  );
}

function errorDetail(error: unknown): string | undefined {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    return typeof message === 'string' ? message : undefined;
  }
  return undefined;
}

/** Runs the store purchase flow for the unlock package. */
export async function purchaseUnlock(pkg?: PurchasesPackage | null): Promise<UnlockOutcome> {
  if (!(await configurePurchases())) return unusableReason();

  const target = pkg ?? pickUnlockPackage(await fetchUnlockOffering());
  if (!target) return { status: 'no-offering' };

  try {
    const { customerInfo } = await Purchases.purchasePackage(target);
    return hasUnlockEntitlement(customerInfo)
      ? { status: 'unlocked' }
      : { status: 'error', detail: 'entitlement-not-active' };
  } catch (error) {
    if (isUserCancellation(error)) return { status: 'cancelled' };
    if (isPaymentPending(error)) return { status: 'pending' };
    return { status: 'error', detail: errorDetail(error) };
  }
}

/** Restores a previous purchase made with the same store account. */
export async function restoreUnlock(): Promise<UnlockOutcome> {
  if (!(await configurePurchases())) return unusableReason();

  try {
    const customerInfo = await Purchases.restorePurchases();
    return hasUnlockEntitlement(customerInfo)
      ? { status: 'unlocked' }
      : { status: 'nothing-to-restore' };
  } catch (error) {
    return { status: 'error', detail: errorDetail(error) };
  }
}

/** Subscribes to entitlement changes (e.g. a refund or a cross-device sync). */
export function subscribeToCustomerInfo(listener: (info: CustomerInfo) => void): () => void {
  if (!isPurchasesUsable()) return () => {};

  Purchases.addCustomerInfoUpdateListener(listener);
  return () => {
    Purchases.removeCustomerInfoUpdateListener(listener);
  };
}
