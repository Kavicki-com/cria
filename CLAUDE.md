# Kavicki starter kit — working notes

Reusable base for **offline, single-purchase mobile apps**: no backend, no
accounts, no subscriptions.

## Which repo is this?

This file is copied into every app, so work out which side you are on before
deciding where a change belongs.

**The kit** (`Kavicki-com/boillerplate`) is the template every app is created
from. It is the source of truth for the apps that do not exist yet.

**An app** is a separate repository created from the kit via "Use this
template". There is no shared history and no remote pointing back, so the
`src/core` you see here is that app's own private copy. Nothing propagates, in
either direction.

### Where a change belongs

| The change is                                                  | Do it                                                        |
| -------------------------------------------------------------- | ------------------------------------------------------------ |
| specific to this product (copy, tabs, behaviour one app wants) | here, in the app. Done — this is why the repos are separate. |
| a bug or improvement that any app would want                   | **both**: here if you need it now, _and_ in the kit repo.    |

The second row is the discipline this model costs. Fixing a kit bug only in the
app leaves it in the kit, so every future app is created carrying it and the
other existing apps keep it. Two such bugs surfaced on the kit's first day —
dark mode doing nothing on Android, and a crash on load in Expo Go — so assume
more will.

Porting between the repos needs no shared history, because a patch is just
text:

```bash
git -C kit format-patch -1 <sha> --stdout > /tmp/fix.patch
git -C app apply /tmp/fix.patch   # or `git am` to keep the original message
```

It applies as long as the files sit at the same paths and have not diverged
much. For a small fix, retyping it is just as good.

## Before you commit

```bash
npm run check   # typecheck + lint + format + locales + invariants
```

`npm run check` is the gate, and CI runs the same thing plus a Metro bundle.

Be aware of what these checks **cannot** see. Two real bugs shipped past a green
typecheck, lint and bundle, and were only caught by actually building:

- `userInterfaceStyle: 'automatic'` did nothing on Android until
  `expo-system-ui` was installed — `expo prebuild` warned about it, nothing else
  did.
- A static `import` of `react-native-mmkv` crashed the app on load in Expo Go.

So when a change touches native config or module loading, run
`npx expo prebuild --platform android` and read its warnings, and launch it.

## Invariants

These are enforced by `scripts/check-invariants.mjs`. Each exists because
breaking it fails at **runtime** while every static check stays green. Do not
"clean them up".

### 1. Modules that throw at import are loaded lazily, behind one owner

Some native modules do a hard native lookup at module top level, so **merely
importing them throws** where their native side is absent. A throw at import
takes the whole app down before any `try/catch` at a call site can run, so the
guard has to be around the _load_:

| Module               | What it does at import                                                                                 | Owner of the lazy load            |
| -------------------- | ------------------------------------------------------------------------------------------------------ | --------------------------------- |
| `react-native-mmkv`  | pulls in `react-native-nitro-modules` → `TurboModuleRegistry.getEnforcing('NitroModules')`             | `src/core/storage/mmkv.ts`        |
| `expo-notifications` | resolves `NotificationsHandlerModule.native` → `requireNativeModule('ExpoNotificationsHandlerModule')` | `src/core/notifications/local.ts` |

Both are missing in Expo Go on **Android**. Notifications are still present in
Expo Go on **iOS**, which is why that failure presents as "works on iOS, will
not open on Android" rather than as anything notification-shaped.

The rules: `import type` only (it is erased at compile time), the value loaded
with a runtime `require` inside a `try/catch`, in the single file that owns the
fallback, and every exported function degrading instead of throwing. Those
guarded `require`s look like code smells. They are not. Leave them.

When you add a dependency with a native side, check whether it throws at
import — read its entry point for `requireNativeModule` or
`TurboModuleRegistry.getEnforcing` — and if it does, add it to
`LAZY_ONLY_MODULES` in `scripts/check-invariants.mjs`. The MMKV case was fixed
first and the rule was written about MMKV alone; that narrow wording is exactly
why the `expo-notifications` instance shipped afterwards.

### 2. No require cycles

Metro allows cycles and only warns at runtime, but a cycle can leave a binding
uninitialized at the moment another module captures it. A hook that returns
`rateNow: requestRating` then closes over `undefined`, and the feature silently
does nothing — no error, no crash, just a button that does not work. That is
how "rate the app" and the notification helpers broke.

The shape to avoid is a barrel that re-exports a hook which imports back from
the barrel. Keep the implementation in its own module (`local.ts`, `prompt.ts`)
and let `index.ts` export both; the hook imports from the implementation, never
from the barrel.

### 3. An app never keeps the kit's identifiers

`BUNDLE_ID`, `APP_SCHEME`, `APP_SLUG`, `APP_NAME`, `package.json`'s `name` and
`extra.eas.projectId` must differ in every app. Two apps cannot share a bundle
id in the stores, and a shared URL scheme means whichever app was installed
last captures the deep link — both only surface at submission or on a tester's
phone. The projectId is committed as the **kit's own** (this repo is built and
shipped from directly); an app that keeps it silently sends its builds into
the kit's EAS project, so `eas init` and paste the new id.

The kit carries `kavickiTemplate: true` in package.json so it may hold the
defaults. Deleting that field is step one of creating an app, and it switches
this check on.

The MMKV storage id and the Android channel id are deliberately NOT in the
list: those live inside the app's own sandbox, so reusing them is harmless.

### 4. The core never imports per-app code

Direction is `app → features → core`, and `features → data`. Nothing in
`src/core` may import from `src/features`, `src/data` or `src/app`. This is the
whole reason the kit is reusable.

### 5. Capability probes, not environment checks

Ask "is this native module registered?" (`src/core/runtime`), never "am I in
Expo Go?". `Constants.executionEnvironment === 'storeClient'` is **not** an Expo
Go check — it is equally true for a dev build made with `expo-dev-client`, so
gating on it disables working features in real builds.

### 6. No hard-coded user-facing strings

Every string lives in `src/core/i18n/locales/{pt,en,es}.json`. pt-BR is the
default and the fallback. `t()` keys are typed from `pt.json`, so a typo fails
the typecheck; `npm run i18n:check` catches keys or placeholders drifting
between locales. Components take already-translated strings as props.

### 7. No backend

No network calls, no accounts, no server. Purchases go through the store via
RevenueCat; everything else is local.

## Where code goes

| Path            | What                                                                                                       |
| --------------- | ---------------------------------------------------------------------------------------------------------- |
| `src/core/`     | reusable: paywall, i18n, theme, notifications, storage, share, onboarding, settings, rating, UI primitives |
| `src/app/`      | Expo Router routes only — thin files that delegate                                                         |
| `src/features/` | per-app domain slices                                                                                      |
| `src/data/`     | per-app data layer (usually SQLite)                                                                        |

Routes stay thin. A screen belongs to a feature; the route file renders it.

## Runtime targets

**Run this kit on a dev build.** In Expo Go four modules are absent —
notifications (removed from Expo Go on Android in SDK 53), MMKV persistence,
purchases and image capture — and no library choice changes that: Expo Go is a
fixed native binary, so any native module not compiled into it is unavailable,
whichever package provides it.

A dev build is not a heavier loop: same Metro, same Fast Refresh, rebuilt only
when a native dependency changes. `npx expo run:android` locally, or
`eas build --profile development`.

Expo Go (`npm run start:go`) is a preview for layout, theming, i18n and
navigation. Settings has a `__DEV__`-only "Simulate unlock" switch so the locked
and unlocked UI can both be built without a store. Never conclude that
persistence, notifications or billing work from Expo Go — and never "fix" a
feature because it is inert there.

## Config traps

- `react-native-purchases` and `expo-system-ui` ship **no config plugin**. They
  are autolinked by prebuild, so adding them to `plugins` in `app.config.ts`
  breaks config resolution.
- `expo-system-ui` is required for the dark theme to work on Android at all.
- Android permissions are decided in the **Gradle manifest merger**, not in the
  prebuild output: `POST_NOTIFICATIONS` is added by the `expo-notifications`
  library manifest, and `android.blockedPermissions` entries still appear in
  prebuild output carrying `tools:node="remove"`. Inspect the built artifact
  (`aapt dump permissions <apk>`) to see what ships.
- An Android notification **channel is immutable once created**: changing its
  options in code (sound, importance, vibration) does nothing on a device that
  already created it. Clear the app's data or reinstall to recreate it. And on
  a channel, any **string** under `sound` is a custom sound filename —
  `'default'` is not a magic value; omit the key for the system default sound
  (see `src/core/notifications/local.ts`).
- iOS dev builds come in two profiles. `development` targets a **physical
  device**, because a build that cannot be installed on a phone is not a useful
  default — it needs a paid Apple Developer account and the device registered
  for provisioning. `development-sim` builds for the **Simulator** instead and
  needs no Apple account, but will not install on a phone. Say which one you
  are producing before spending a build: EAS build quota is finite, and a
  simulator artifact cannot be converted into a device one.
- Import icon sets by path, never from the barrel. `import { Ionicons } from
'@expo/vector-icons'` pulls **every** icon font into the bundle — 11 fonts,
  4.4 MB of assets for one set in use. `import Ionicons from
'@expo/vector-icons/Ionicons'` ships only that font and takes the export's
  assets from 5.0 MB to 1.5 MB. The same applies to any package whose barrel
  re-exports assets.
- `eas.json` profiles carry **no `channel`**. A channel only means something
  with `expo-updates`, and EAS stops a build that names one without it —
  offering to install the package and then asking for `updates.url` and
  `runtimeVersion` in the app config, which it cannot write into a TypeScript
  one. None of that is needed for a dev build. An app that wants OTA updates
  adds `expo-updates`, runs `eas update:configure` and puts the channels back.
- `extra.eas` is absent on purpose. Each app runs `eas init` and pastes the
  printed id as a literal, because `app.config.ts` is TypeScript so `eas init`
  cannot write it, and `.env.local` is never seen by the build server. Shipping
  a placeholder UUID is worse than shipping nothing: EAS then fails with
  "Experience with id '0000…' does not exist" instead of naming the real fix.

## Commit style

Conventional-commit subjects (`feat:`, `fix:`, `chore:`). Say what broke and why
the fix works, and state plainly what was verified and what was not. Do not add
Claude attribution or co-author trailers.

## Cria — onde está o plano

Este app é o **Cria — Meu plano de negócios**. Antes de qualquer tarefa, leia
`docs/cria/PLANO.md` (plano, fases, modelo de dados, regras) e use `docs/cria/design/`
como referência visual — o mapa tela → rota está em `docs/cria/design/README.md`.
Referências de código da casa: `Kavicki-com/penduro` (principal) e
`Kavicki-com/churrapp`. Não use o Vjez como referência.
Trabalhe uma fase por vez e pare no fim de cada uma para revisão.
