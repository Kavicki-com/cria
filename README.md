# Kavicki Starter Kit

Reusable base for **offline, single-purchase mobile apps** — no backend, no
accounts, no subscriptions. Clone it with **Use this template** on GitHub and
build the app on top; the shared plumbing (paywall, i18n, theme, local
notifications, settings, onboarding, rating prompt) is already wired.

> This repository is a template, not a shippable app. The `Home` and `Pro` tabs
> are demos that show how the core modules connect — replace them.

## Stack

| Concern            | Choice                                                           |
| ------------------ | ---------------------------------------------------------------- |
| Runtime            | Expo SDK 57 · React Native 0.86 · React 19 · TypeScript (strict) |
| Navigation         | Expo Router (tabs)                                               |
| State              | Zustand                                                          |
| One-time unlock    | `react-native-purchases` (RevenueCat), non-consumable            |
| Notifications      | `expo-notifications` — **local only**, no FCM/APNs               |
| i18n               | `expo-localization` + `i18n-js` — pt-BR default and fallback     |
| Config storage     | MMKV (`react-native-mmkv` + `react-native-nitro-modules`)        |
| Sharing (optional) | WhatsApp `wa.me` · `react-native-view-shot` · `expo-print`       |

## Use a dev build

**A dev build is the way to run this kit.** Not a formality — in Expo Go four of
the kit's modules are simply absent, and the one that matters most cannot be
worked around by any library:

| In Expo Go | Local notifications | Persistence (MMKV) | Purchases | Image capture |
| ---------- | ------------------- | ------------------ | --------- | ------------- |
| iOS        | partial             | ✗ in-memory        | ✗         | ✗             |
| Android    | ✗ removed in SDK 53 | ✗ in-memory        | ✗         | ✗             |

Expo Go ships a fixed native binary, so swapping `expo-notifications` for
notifee or anything else changes nothing — every notification library is native
code that is equally not in there.

**A dev build is not a heavier loop.** Once installed it uses the same Metro and
the same Fast Refresh as Expo Go; you rebuild only when a native dependency
changes. The one-time cost buys a device where everything actually runs.

```bash
# locally — needs Android Studio's SDK and JDK 17
npx expo run:android

# or in the cloud — needs an Expo account, no local SDK
eas init
eas build --profile development --platform android
# install the APK, then:
npm start
```

`eas init` prints a project id; paste it into `app.config.ts` as
`extra.eas.projectId`, replacing the kit's own id that ships there, before
building. Start with `--platform android` — adding
`ios` asks for Apple credentials mid-flow.

Expo Go (`npm run start:go`) is still there, and it is fine for pure layout,
theming, i18n and navigation work. Treat it as a preview, never as a place to
verify behaviour — see [Expo Go mode](#expo-go-mode-frontend-only).

## Getting started

```bash
npm install
cp .env.example .env.local        # fill in the RevenueCat public keys

eas build --profile development --platform android   # or: npx expo run:android
npm start                                            # expo start --dev-client
```

Checks:

```bash
npm run typecheck    # tsc --noEmit
npm run lint         # expo lint (eslint + prettier)
npm run i18n:check   # every locale in sync with pt.json
```

## Expo Go mode (frontend only)

Expo Go bundles a fixed set of native modules, so three of the kit's
dependencies are absent there. Each one degrades instead of crashing:

| Module                        | In Expo Go | Behaviour                                        |
| ----------------------------- | ---------- | ------------------------------------------------ |
| `react-native-mmkv` (+ Nitro) | absent     | preferences fall back to **in-memory** storage   |
| `react-native-purchases`      | absent     | paywall shows "purchases unavailable in Expo Go" |
| `react-native-view-shot`      | absent     | "share image" returns `unavailable`              |
| `expo-notifications`          | present    | local reminders and the Android 13+ prompt work  |

MMKV is the one that used to be fatal: `react-native-mmkv` imports
`react-native-nitro-modules`, which calls
`TurboModuleRegistry.getEnforcing('NitroModules')` at module top level and
**throws** when Nitro is missing. A static `import` would take the whole app
down before any guard could run, so `src/core/storage/mmkv.ts` loads it with a
runtime `require` inside a `try/catch`. Keep it that way.

The guards are **capability probes, not environment checks** (see
`src/core/runtime`): they ask "is this native module registered?" rather than
"am I in Expo Go?". Note that `Constants.executionEnvironment === 'storeClient'`
is _not_ an Expo Go check — it is also true for a dev build made with
expo-dev-client.

### Simulating the unlock

Purchases cannot run in Expo Go, so Settings has a **Development** section
(`__DEV__` only, dropped from release bundles) with a **Simulate unlock**
switch. It overrides the entitlement flag, so both the locked and the unlocked
UI — the paywall, the padlocked tab, every `useGate()` call site — can be built
and reviewed without a store.

### What Expo Go does NOT prove

Two caveats worth repeating, because the behaviour genuinely differs:

- **Preferences are ephemeral.** They survive Fast Refresh but not a full
  reload, so locale, theme, the onboarding flag and the unlock flag reset.
  Settings shows a warning when this is the case. Never conclude "persistence
  is broken" from Expo Go — verify it on a dev build.
- **Nothing about billing is exercised.** The simulated unlock is a local
  boolean; it says nothing about RevenueCat, the entitlement mapping or the
  store flow.

Use Expo Go for layout, theming, i18n and navigation. Use a dev build for
anything involving storage, purchases or image capture.

## Repository layout

```
src/
  app/                 # Expo Router routes only — thin files that delegate
    _layout.tsx        #   providers, onboarding gate, modal paywall
    (tabs)/
      _layout.tsx      #   tab bar + the "locked tab" pattern
      index.tsx        #   demo home — REPLACE
      pro.tsx          #   demo gated screen — REPLACE
      settings.tsx     #   renders core SettingsScreen
    onboarding.tsx
    paywall.tsx
    +not-found.tsx

  core/                # REUSABLE — shared by every app, do not add domain code
    components/        #   Screen, Text, Button, Card, Badge, Settings rows
    config/            #   typed EXPO_PUBLIC_* access
    i18n/              #   i18n-js setup + locales/{pt,en,es}.json
    notifications/     #   local reminders + Android 13+ permission handling
    onboarding/        #   skippable intro
    paywall/           #   Paywall, LockedNotice, locked-tab helpers
    purchases/         #   RevenueCat client, useUnlock(), gating
    rating/            #   store review prompt + policy
    settings/          #   SettingsScreen
    share/             #   WhatsApp / image / PDF (optional modules)
    storage/           #   MMKV + persisted Zustand config store
    theme/             #   color + typography tokens, light/dark

  features/            # PER APP — your domain slices go here (placeholder)
  data/                # PER APP — your data layer goes here (placeholder)
```

**Dependency direction:** `app` → `features` → `core`, and `features` → `data`.
`src/core` must never import from `src/features` or `src/data` — that is what
keeps it reusable.

## Where each app adds its own code

### Features → `src/features/<slice>/`

One folder per domain slice, with its own components, hooks, screens and
Zustand store. Export a public surface from `index.ts` and keep the matching
file in `src/app` thin. See `src/features/README.md`.

### Data layer → `src/data/`

The relational store is deliberately **not** in the kit. `@/core/storage` only
holds small preferences (unlock flag, locale, theme). Anything list-shaped goes
in `src/data`, usually SQLite:

```bash
npx expo install expo-sqlite
```

See `src/data/README.md` for the suggested `db.ts` / `migrations/` /
`repositories/` shape.

## Core modules in practice

### One-time unlock and gating

```tsx
import { useUnlock, useGate, openPaywall } from '@/core/purchases';
import { LockedNotice } from '@/core/paywall';

const { unlocked, price, purchase, restore } = useUnlock();

// Guard an action
const { requireUnlock } = useGate('export-button');
<Button label={t('export.cta')} onPress={() => requireUnlock(exportPdf)} />;

// Guard a whole screen
if (!unlocked) return <LockedNotice source="my-screen" />;
```

`unlocked` is cached in MMKV, so gating is correct on first render and offline.
The flag is refreshed from RevenueCat at startup and whenever the entitlement
changes.

### Locked tab with a padlock

The pattern lives in `src/core/paywall/lockedTab.tsx` and is used by the `pro`
tab: the tab stays visible for discoverability, the press is intercepted, and
the user lands on the paywall.

```tsx
<Tabs.Screen
  name="pro"
  options={{
    title: t('tabs.pro'),
    tabBarIcon: ({ color, size }) => (
      <LockedTabIcon name="sparkles-outline" color={color} size={size} locked={!unlocked} />
    ),
  }}
  listeners={lockedTabListeners('tab-pro')}
/>
```

The screen re-checks the entitlement itself, because a deep link can land there
directly.

### i18n — zero hard-coded copy

Every user-facing string lives in `src/core/i18n/locales/{pt,en,es}.json`.
`pt-BR` is both the default and the fallback; `t()` keys are typed from
`pt.json`, so a typo fails `npm run typecheck`.

```tsx
const { t } = useTranslation();
<Text>{t('home.subtitle')}</Text>
<Text>{t('onboarding.stepLabel', { current: 1, total: 3 })}</Text>
```

Adding copy: add the key to all three files under a scope named after the
feature, then run `npm run i18n:check`. Components receive
already-translated strings as props — they never hold literal copy.

### Local notifications

```tsx
import { scheduleInSeconds, scheduleDaily, cancelAllReminders } from '@/core/notifications';

await scheduleDaily({ title: t('reminder.title'), body: t('reminder.body') }, 20, 0);
```

No remote push is configured. The helpers request the permission (including
`POST_NOTIFICATIONS` on Android 13+) and create the Android channel before
scheduling, returning `null` when permission is refused. `useNotificationPermission()`
backs the Settings toggle and detects the permanently-denied case so the user
can be sent to the system settings.

### Theme

Tokens in `src/core/theme/tokens.ts` (colors, spacing, radii, typography) with
light and dark palettes. `useTheme()` resolves the user's preference, falling
back to the OS scheme. Override the palette per app instead of hard-coding
colors.

### Rating prompt

```tsx
import { maybeRequestRating } from '@/core/rating';
await maybeRequestRating(); // respects launch count + cooldown
```

Uses the native in-app review sheet when available, else opens the store
listing. Settings also exposes an explicit "Rate the app" row.

### Sharing (optional modules)

Import only what the app needs:

```tsx
import { shareToWhatsApp, shareViewAsImage, sharePdf } from '@/core/share';
```

## Configuration

### `.env.example` → `.env.local`

Only `EXPO_PUBLIC_*` variables reach the app, and they are inlined into the JS
bundle — so **only public values belong there**. RevenueCat _public SDK keys_
are safe to ship; its secret API key is not. `.env` and `.env*.local` are
gitignored; never commit real keys.

With no RevenueCat key present the app still runs: gating works, and the
paywall explains that purchases are unavailable.

### Per-app changes in `app.config.ts`

- `APP_NAME`, `APP_SLUG`, `APP_SCHEME`, `BUNDLE_ID`
- `extra.eas.projectId` (run `eas init` — the committed id is the kit's own,
  and `npm run check` refuses it in an app)
- icons and splash under `assets/images/`
- `expo-localization`'s `supportedLocales` if the app ships other languages

### Android permissions and autolinking

`react-native-purchases` and `expo-system-ui` have **no config plugin** — both
are autolinked by prebuild, so neither belongs in the `plugins` array (listing
them there breaks config resolution). `expo-system-ui` is a hard requirement
for `userInterfaceStyle: 'automatic'`: without it Android ignores the dark
theme entirely.

Permissions in the final merged manifest:

| Permission                    | Where it comes from                   | Why                                            |
| ----------------------------- | ------------------------------------- | ---------------------------------------------- |
| `com.android.vending.BILLING` | `app.config.ts`                       | Play Billing, behind the RevenueCat unlock     |
| `POST_NOTIFICATIONS`          | `expo-notifications` library manifest | Android 13+ runtime prompt for local reminders |
| `INTERNET`                    | Expo template                         | RevenueCat talks to the store; Metro in dev    |
| `VIBRATE`                     | Expo template                         | the reminder channel vibrates                  |

The Expo Android template also injects `READ_EXTERNAL_STORAGE`,
`WRITE_EXTERNAL_STORAGE` and `SYSTEM_ALERT_WINDOW`. An offline, no-backend app
needs none of them, so `android.blockedPermissions` strips them.

Note that both the additions and the removals happen in the **manifest merger
at Gradle build time** — `expo prebuild` output still shows the blocked ones
carrying `tools:node="remove"`. To check what actually ships, inspect the built
artifact (`aapt dump permissions <apk>`), not the prebuild output.

### EAS build profiles (`eas.json`)

| Profile              | Purpose                                                                                                  |
| -------------------- | -------------------------------------------------------------------------------------------------------- |
| `development`        | dev client; Android APK, iOS **simulator** — no Apple account needed                                     |
| `development-device` | same, but iOS for a **physical iPhone** — needs a paid Apple Developer account and the device registered |
| `preview`            | internal testing build of the release JS                                                                 |
| `production`         | store build, Android App Bundle, auto version increment                                                  |

## Starting a new app

Each app is its own repository, created with **"Use this template"** on GitHub.

That gives each app a clean slate: a single fresh commit, no shared history and
no remote pointing back at the kit. The team chose this deliberately, for
isolation — a problem in one app cannot reach the others — and for asymmetric
evolution, so each app can diverge at whatever pace its product needs.

### What that costs, and how to pay it

Nothing propagates, in either direction. So a bug found in the kit has to be
carried to each app by hand, and a kit bug fixed only inside an app stays in the
kit, where every future app will inherit it. When a fix matters to more than one
app, do it in **both** places: the app that needs it now, and the kit, which is
the source of truth for the apps that do not exist yet.

Porting needs no shared history, because a patch is just text:

```bash
git -C kit format-patch -1 <sha> --stdout > /tmp/fix.patch
git -C app apply /tmp/fix.patch   # or `git am` to keep the original message
```

Record which kit commit an app was created from — without shared history, that
stamp is the only way to answer "which apps predate this fix?".

### If the calculus changes

Two other models exist, should hand-porting start to hurt:

- **Clone and repoint the remotes** instead of using the template. The app keeps
  the kit's history, so `git fetch upstream && git merge upstream/main` works.
  Note this only works if chosen at creation time — a template-generated repo
  has no common ancestor, so merging into it is not possible later.
- **Extract `src/core` into a versioned package.** Fixes propagate with a
  version bump, at the price of real coupling: a bad release breaks every app
  that upgrades. Worth revisiting around the second or third app, not before.

No profile sets a `channel`, because a channel requires `expo-updates` and EAS
refuses to build without it. A dev build needs neither. To adopt OTA updates,
install `expo-updates`, run `eas update:configure` and add the channels back.

## Checklist for a new app from this template

1. **Use this template** → new repository, then `npm install`.
2. Delete `"kavickiTemplate": true` from `package.json`. That field marks the
   kit, and removing it turns on the check that refuses the kit's identifiers.
3. Change `package.json`'s `name`, and in `app.config.ts` the `APP_NAME`,
   `APP_SLUG`, `APP_SCHEME` and `BUNDLE_ID`. Two apps cannot share a bundle id
   in the stores, and a shared scheme means the last app installed wins the deep
   link. `npm run check` fails until these differ.
4. `eas init` and paste the printed id as `extra.eas.projectId`, replacing the
   kit's id (`npm run check` fails while an app still carries it).
5. Replace the icons and splash in `assets/images/`.
6. Create the RevenueCat project, add a **non-consumable** product and an
   entitlement; put the public keys in `.env.local`.
7. Replace the demo copy in `locales/*.json` and drop the `home.*` / `pro.*`
   demo keys once the real screens exist.
8. Add the data layer in `src/data` and the domain in `src/features`.
9. Replace `(tabs)/index.tsx` and `(tabs)/pro.tsx` with real screens; keep the
   locked-tab pattern for whatever the paid feature turns out to be.
10. `npm run typecheck && npm run lint && npm run i18n:check`, then build a dev
    client and test the purchase flow in a store sandbox account.

## Conventions

- No backend, no network calls, no accounts.
- No hard-coded user-facing strings — everything through `t()`.
- Never assume Expo Go; always a dev build.
- No secrets in the repository.
- TypeScript everywhere, `strict` on.
