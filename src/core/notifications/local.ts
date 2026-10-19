// `import type` is erased at compile time, so it emits no runtime require.
import type * as NotificationsModule from 'expo-notifications';
import { Linking, Platform } from 'react-native';

import { i18n } from '../i18n';
import { getConfig } from '../storage/configStore';

/**
 * LOCAL notifications only.
 *
 * There is no FCM/APNs setup, no push token and no server: everything here
 * schedules reminders on the device itself.
 *
 * On Android 13+ (API 33) `POST_NOTIFICATIONS` is a runtime permission. The
 * manifest entry comes from `expo-notifications` itself; the request is made
 * here, right before the first schedule, so the prompt has context.
 *
 * ## Why the module is loaded lazily
 *
 * On native, `expo-notifications` resolves `NotificationsHandlerModule.native`,
 * which runs `requireNativeModule('ExpoNotificationsHandlerModule')` at module
 * top level. `requireNativeModule` THROWS when the module is not registered —
 * and Expo Go on Android does not register it (notifications were dropped from
 * Expo Go on Android), while Expo Go on iOS still does.
 *
 * So a static import of `expo-notifications` takes the whole app down at load
 * on Android while iOS works fine. Same failure shape as `react-native-mmkv`
 * (see `src/core/storage/mmkv.ts`): the import itself throws, so no try/catch
 * around the call sites can help. The guard has to be around the load.
 */

export const DEFAULT_CHANNEL_ID = 'reminders';

type Notifications = typeof NotificationsModule;

let cached: Notifications | null | undefined;

/** Loads expo-notifications, or returns null where its native side is absent. */
function notifications(): Notifications | null {
  if (cached === undefined) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      cached = require('expo-notifications') as Notifications;
    } catch {
      cached = null;
    }
  }
  return cached;
}

/**
 * False in Expo Go on Android, where the native module does not exist. Every
 * function below degrades instead of throwing, so the UI can explain itself.
 */
export function isNotificationsAvailable(): boolean {
  return notifications() !== null;
}

/** Foreground presentation. Safe to call at module load of the root layout. */
export function configureNotificationHandler(): void {
  const api = notifications();
  if (!api) return;

  api.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/** Android requires an explicit channel before anything is displayed. */
export async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;

  const api = notifications();
  if (!api) return;

  try {
    await api.setNotificationChannelAsync(DEFAULT_CHANNEL_ID, {
      name: i18n.t('notifications.defaultChannelName'),
      importance: api.AndroidImportance.DEFAULT,
      lockscreenVisibility: api.AndroidNotificationVisibility.PRIVATE,
      // `sound` is NOT omitted by accident. On input the field is a file name
      // (`sound?: string | null`) resolved against res/raw, so passing
      // 'default' makes Android look for a sound file called "default" and warn
      // that it is missing. The 'default' | 'custom' union is the shape Android
      // reports back, not what it accepts. Leaving it out uses the system
      // notification sound, which is what we want.
      vibrationPattern: [0, 250, 250, 250],
      enableVibrate: true,
    });
  } catch {
    // Creating the channel is best-effort: never let it break app startup.
  }
}

export type PermissionState = 'granted' | 'denied' | 'undetermined' | 'unavailable';

export async function getNotificationPermission(): Promise<PermissionState> {
  const api = notifications();
  if (!api) return 'unavailable';

  try {
    const settings = await api.getPermissionsAsync();
    if (settings.granted) return 'granted';
    return settings.canAskAgain ? 'undetermined' : 'denied';
  } catch {
    return 'unavailable';
  }
}

/**
 * Requests the notification permission, including `POST_NOTIFICATIONS` on
 * Android 13+. Returns the resulting state, never throws.
 */
export async function requestNotificationPermission(): Promise<PermissionState> {
  const api = notifications();
  if (!api) return 'unavailable';

  try {
    const current = await api.getPermissionsAsync();
    if (current.granted) return 'granted';

    // `canAskAgain === false` means the user permanently denied it: the OS will
    // not show a prompt again, so the caller should send them to Settings.
    if (!current.canAskAgain) return 'denied';

    const result = await api.requestPermissionsAsync({
      ios: { allowAlert: true, allowBadge: false, allowSound: true },
    });

    return result.granted ? 'granted' : result.canAskAgain ? 'undetermined' : 'denied';
  } catch {
    return 'denied';
  }
}

/** Opens the OS settings page for this app, for a permanently denied prompt. */
export async function openSystemNotificationSettings(): Promise<void> {
  await Linking.openSettings();
}

/**
 * Makes sure we are allowed to schedule, creating the Android channel and
 * remembering the user's choice in the config store.
 */
export async function ensureNotificationsReady(): Promise<boolean> {
  const state = await requestNotificationPermission();
  const granted = state === 'granted';

  getConfig().setNotificationsEnabled(granted);
  if (granted) {
    await ensureAndroidChannel();
  }
  return granted;
}

export type LocalReminder = {
  /** Already-translated title and body. */
  title: string;
  body: string;
  /** Extra payload handed back when the notification is tapped. */
  data?: Record<string, unknown>;
};

function contentOf(reminder: LocalReminder) {
  return { title: reminder.title, body: reminder.body, data: reminder.data ?? {} };
}

/** Fires once, `seconds` from now. Returns the notification id, or null. */
export async function scheduleInSeconds(
  reminder: LocalReminder,
  seconds: number,
): Promise<string | null> {
  const api = notifications();
  if (!api) return null;
  if (!(await ensureNotificationsReady())) return null;

  return api.scheduleNotificationAsync({
    content: contentOf(reminder),
    trigger: {
      type: api.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(1, Math.round(seconds)),
      repeats: false,
      channelId: DEFAULT_CHANNEL_ID,
    },
  });
}

/** Repeats every day at the given local time. Returns the id, or null. */
export async function scheduleDaily(
  reminder: LocalReminder,
  hour: number,
  minute = 0,
): Promise<string | null> {
  const api = notifications();
  if (!api) return null;
  if (!(await ensureNotificationsReady())) return null;

  return api.scheduleNotificationAsync({
    content: contentOf(reminder),
    trigger: {
      type: api.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: DEFAULT_CHANNEL_ID,
    },
  });
}

/** Fires once at an absolute date. Returns the id, or null. */
export async function scheduleAt(reminder: LocalReminder, date: Date): Promise<string | null> {
  const api = notifications();
  if (!api) return null;
  if (!(await ensureNotificationsReady())) return null;

  return api.scheduleNotificationAsync({
    content: contentOf(reminder),
    trigger: {
      type: api.SchedulableTriggerInputTypes.DATE,
      date,
      channelId: DEFAULT_CHANNEL_ID,
    },
  });
}

export async function cancelReminder(id: string): Promise<void> {
  await notifications()?.cancelScheduledNotificationAsync(id);
}

export async function cancelAllReminders(): Promise<void> {
  await notifications()?.cancelAllScheduledNotificationsAsync();
}

export async function listScheduledReminders(): Promise<NotificationsModule.NotificationRequest[]> {
  return (await notifications()?.getAllScheduledNotificationsAsync()) ?? [];
}
