import { useCallback, useEffect, useState } from 'react';

import { useConfigStore } from '../storage/configStore';
import {
  ensureNotificationsReady,
  getNotificationPermission,
  isNotificationsAvailable,
  openSystemNotificationSettings,
  type PermissionState,
} from './local';

export type UseNotificationPermission = {
  status: PermissionState | 'loading';
  /** User-facing toggle state, persisted in the config store. */
  enabled: boolean;
  /** True when the OS will no longer prompt and Settings must be opened. */
  blocked: boolean;
  /** False where the native module is absent (Expo Go on Android). */
  available: boolean;
  request: () => Promise<boolean>;
  openSettings: () => Promise<void>;
};

/**
 * Wires the notification permission to the Settings toggle, handling the
 * Android 13+ `POST_NOTIFICATIONS` runtime prompt.
 */
export function useNotificationPermission(): UseNotificationPermission {
  const enabled = useConfigStore((state) => state.notificationsEnabled);
  const setEnabled = useConfigStore((state) => state.setNotificationsEnabled);
  const [status, setStatus] = useState<PermissionState | 'loading'>('loading');

  useEffect(() => {
    let active = true;

    getNotificationPermission().then((next) => {
      if (!active) return;
      setStatus(next);
      // Permission revoked in the OS settings while the app was closed.
      if (next !== 'granted' && enabled) {
        setEnabled(false);
      }
    });

    return () => {
      active = false;
    };
  }, [enabled, setEnabled]);

  const request = useCallback(async () => {
    const granted = await ensureNotificationsReady();
    setStatus(await getNotificationPermission());
    return granted;
  }, []);

  return {
    status,
    enabled,
    blocked: status === 'denied',
    available: isNotificationsAvailable(),
    request,
    openSettings: openSystemNotificationSettings,
  };
}
