// `import type` is erased at compile time, so it emits no runtime require.
import type * as DateTimePickerModule from '@react-native-community/datetimepicker';

/**
 * The native date picker for a task's day.
 *
 * This is the single file allowed to load `@react-native-community/
 * datetimepicker` at runtime (invariant 1, `scripts/check-invariants.mjs`).
 * On Android its entry point reaches, at import time,
 *
 *   src/datepicker.android.js -> src/specs/NativeModuleDatePicker.js
 *   export default TurboModuleRegistry.getEnforcing('RNCDatePicker')
 *
 * so a static import throws wherever that module is not compiled in and the
 * whole app fails to load. The require sits inside the guard (as Pendurô's
 * `lancamentos/seletorData.tsx`).
 */

type Modulo = typeof DateTimePickerModule;

let cache: Modulo | null | undefined;

function carregar(): Modulo | null {
  if (cache !== undefined) return cache;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cache = require('@react-native-community/datetimepicker') as Modulo;
  } catch {
    cache = null;
  }
  return cache;
}

/** False where the native picker is absent; the date then cannot be set. */
export function isSeletorDataDisponivel(): boolean {
  return carregar() !== null;
}

/** Android: the system date dialog. Resolves with the chosen day, or null. */
export function escolherDiaAndroid(atual: Date): Promise<Date | null> {
  const modulo = carregar();
  if (!modulo) return Promise.resolve(null);
  return new Promise((resolve) => {
    modulo.DateTimePickerAndroid.open({
      value: atual,
      mode: 'date',
      minimumDate: new Date(),
      onDismiss: () => resolve(null),
      onValueChange: (_evento, dia) => resolve(dia),
    });
  });
}

/** iOS: the inline calendar, rendered inside the task sheet. */
export function SeletorDiaIOS({
  valor,
  onChange,
  escuro,
  locale,
}: {
  valor: Date;
  onChange: (dia: Date) => void;
  escuro: boolean;
  locale: string;
}) {
  const modulo = carregar();
  if (!modulo) return null;
  const Picker = modulo.default;
  return (
    <Picker
      value={valor}
      mode="date"
      display="inline"
      minimumDate={new Date()}
      themeVariant={escuro ? 'dark' : 'light'}
      locale={locale}
      onValueChange={(_evento, dia) => onChange(dia)}
    />
  );
}
