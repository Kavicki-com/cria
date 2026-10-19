#!/usr/bin/env node
/**
 * Guards the structural invariants of the reusable core.
 *
 * These are rules that typecheck, lint and a Metro bundle all happily accept
 * while the app breaks at runtime — exactly the class of bug that only showed
 * up when someone ran `expo prebuild` or launched Expo Go. They are checked
 * statically so CI catches them on the way in.
 *
 * Run with `npm run check:invariants`.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(root, 'src');

/** Every .ts/.tsx file under src/, as { path, rel, text }. */
function sourceFiles(dir = srcDir, out = []) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      sourceFiles(path, out);
    } else if (/\.tsx?$/.test(entry)) {
      out.push({ path, rel: relative(root, path), text: readFileSync(path, 'utf8') });
    }
  }
  return out;
}

const files = sourceFiles();
const problems = [];

/**
 * Finds imports that survive compilation, i.e. anything but `import type`.
 *
 * The `from` clause is optional on purpose: a bare `import 'mod'` emits no
 * binding but still runs the module's top-level side effects — which for
 * react-native-mmkv is precisely the Nitro throw we are guarding against.
 */
function valueImportsOf(text, moduleName) {
  const pattern = new RegExp(
    String.raw`^\s*import\s+(?!type\s)(?:[^;]*?from\s*)?['"]${moduleName}['"]`,
    'gm',
  );
  return text.match(pattern) ?? [];
}

// ---------------------------------------------------------------------------
// 1. Modules that throw at import must be loaded lazily, behind one owner.
//
// Some native modules run a hard native lookup at module top level, so merely
// importing them throws where their native side is absent — and a throw at
// import takes the whole app down before any try/catch at a call site can run:
//
//   react-native-mmkv      -> react-native-nitro-modules ->
//                             TurboModuleRegistry.getEnforcing('NitroModules')
//   expo-notifications     -> NotificationsHandlerModule.native ->
//                             requireNativeModule('ExpoNotificationsHandlerModule')
//   expo-sqlite            -> ExpoSQLite.js ->
//                             requireNativeModule('ExpoSQLite') at top level
//   @react-native-community/datetimepicker
//                          -> (android) datepicker -> specs/NativeModuleDatePicker
//                             TurboModuleRegistry.getEnforcing('RNCDatePicker')
//
// expo-sqlite does ship inside Expo Go today, so its guard is precautionary —
// but what puts a module on this list is the top-level native lookup, not a
// survey of which runtimes happen to carry it.
//
// Both are absent in Expo Go on Android (notifications are still present in
// Expo Go on iOS, which is why that failure looks Android-only). The only legal
// access is a runtime `require` inside a try/catch, in the one file that owns
// the fallback.
//
// Add a module here the moment it is found to throw at import; fixing these one
// at a time is how the second instance shipped.
// ---------------------------------------------------------------------------
const LAZY_ONLY_MODULES = [
  { module: 'react-native-mmkv', owner: 'src/core/storage/mmkv.ts' },
  { module: 'react-native-nitro-modules', owner: 'src/core/storage/mmkv.ts' },
  { module: 'expo-notifications', owner: 'src/core/notifications/local.ts' },
  { module: 'expo-sqlite', owner: 'src/data/db.ts' },
  {
    module: '@react-native-community/datetimepicker',
    owner: 'src/features/planoAcao/seletorData.tsx',
  },
];

for (const file of files) {
  for (const { module: moduleName, owner } of LAZY_ONLY_MODULES) {
    for (const line of valueImportsOf(file.text, moduleName)) {
      problems.push(
        `${file.rel}: static value import of "${moduleName}" (${line.trim()}).\n` +
          `    This module throws at import where its native side is absent (Expo Go),\n` +
          `    taking the whole app down at load — a call-site try/catch cannot help.\n` +
          `    Use \`import type\` for types, and let ${owner} load the value lazily.`,
      );
    }

    // The guarded require belongs to exactly one file.
    if (file.text.includes(`require('${moduleName}')`) && file.rel !== owner) {
      problems.push(
        `${file.rel}: requires "${moduleName}" directly.\n` +
          `    Go through ${owner}, which owns the fallback.`,
      );
    }
  }
}

// Each guard itself must stay in place.
for (const { module: moduleName, owner } of LAZY_ONLY_MODULES) {
  const ownerFile = files.find((f) => f.rel === owner);

  if (!ownerFile) {
    problems.push(`${owner} is missing — it owns the lazy load of "${moduleName}".`);
    continue;
  }

  const requireAt = ownerFile.text.indexOf(`require('${moduleName}')`);
  // nitro is reached through mmkv, so its owner holds no require of its own.
  if (requireAt === -1) continue;

  // Positional check: the require must sit after a `try {` with no `catch`
  // between them. A regex over the span is unreliable — a destructuring such as
  // `const { createMMKV } =` contains a closing brace.
  const before = ownerFile.text.slice(0, requireAt);
  const lastTry = before.lastIndexOf('try {');
  const guarded = lastTry !== -1 && !before.slice(lastTry).includes('catch');

  if (!guarded) {
    problems.push(
      `${owner}: the require of "${moduleName}" is no longer inside a try block.\n` +
        `    Without the guard the app crashes on load where the native module is absent.`,
    );
  }
}

// ---------------------------------------------------------------------------
// 2. The core must not depend on per-app code.
//
// This is what keeps the kit reusable: app -> features -> core, never back.
// ---------------------------------------------------------------------------
// `from` is optional here too, so a side-effect-only import cannot sneak the
// dependency in.
const FORBIDDEN_IN_CORE = [
  {
    pattern: /^\s*import\s+(?:[^;]*?from\s*)?['"]@\/(features|data|app)\b/m,
    label: '@/features, @/data or @/app',
  },
  {
    pattern: /^\s*import\s+(?:[^;]*?from\s*)?['"](\.\.\/)+(features|data|app)\//m,
    label: 'a relative ../features, ../data or ../app path',
  },
];

for (const file of files.filter((f) => f.rel.startsWith(join('src', 'core')))) {
  for (const { pattern, label } of FORBIDDEN_IN_CORE) {
    if (pattern.test(file.text)) {
      problems.push(
        `${file.rel}: core imports ${label}.\n` +
          `    The core must stay independent of per-app code (app -> features -> core).`,
      );
    }
  }
}

// ---------------------------------------------------------------------------
// 3. Native availability must be decided by capability, not by environment.
//
// `Constants.executionEnvironment === 'storeClient'` is NOT an Expo Go check:
// it is equally true for a dev build made with expo-dev-client, so gating on it
// disables working features in real builds. src/core/runtime owns the probes.
// ---------------------------------------------------------------------------
const RUNTIME_OWNER = join('src', 'core', 'runtime');

for (const file of files) {
  if (file.rel.startsWith(RUNTIME_OWNER)) continue;
  if (/executionEnvironment|appOwnership/.test(file.text)) {
    problems.push(
      `${file.rel}: branches on executionEnvironment/appOwnership.\n` +
        `    'storeClient' is also true for a dev build, so this misfires in real builds.\n` +
        `    Ask whether the native module exists instead — see src/core/runtime.`,
    );
  }
}

// ---------------------------------------------------------------------------
// 4. No require cycles inside src/.
//
// Metro allows cycles and only warns at runtime, but a cycle can leave a
// binding uninitialized at the moment another module captures it — so a hook
// that does `rateNow: requestRating` can close over `undefined` and the feature
// silently does nothing. That is how "rate the app" and the notification
// helpers broke: a barrel re-exported a hook that imported back from the
// barrel. Keep the implementation in its own module and let the barrel export
// both.
// ---------------------------------------------------------------------------
const graph = new Map();

/** Resolves a relative import to the .ts/.tsx file it refers to. */
function resolveRelative(fromRel, spec) {
  const dir = dirname(join(root, fromRel));
  const base = join(dir, spec);
  const candidates = [`${base}.ts`, `${base}.tsx`, join(base, 'index.ts'), join(base, 'index.tsx')];
  for (const candidate of candidates) {
    const rel = relative(root, candidate);
    if (files.some((f) => f.rel === rel)) return rel;
  }
  return null;
}

for (const file of files) {
  // Both `from './x'` (import and re-export) and the bare `import './x'`,
  // whose side effects are enough to form a cycle. Treating `from` as required
  // is a blind spot this checker has fallen into more than once.
  const specs = [...file.text.matchAll(/(?:from|^\s*import)\s*['"](\.[^'"]+)['"]/gm)].map(
    (m) => m[1],
  );
  const edges = specs
    .map((spec) => resolveRelative(file.rel, spec))
    .filter((target) => target !== null);
  graph.set(file.rel, edges);
}

const cycles = [];
const state = new Map();

function walk(node, stack) {
  if (state.get(node) === 'done') return;
  if (state.get(node) === 'open') {
    // `stack` already ends at `node`, so slicing from its first occurrence
    // gives the whole loop without repeating the entry twice.
    cycles.push(stack.slice(stack.indexOf(node)));
    return;
  }
  state.set(node, 'open');
  for (const next of graph.get(node) ?? []) walk(next, [...stack, next]);
  state.set(node, 'done');
}

for (const file of files) walk(file.rel, [file.rel]);

const seen = new Set();
for (const cycle of cycles) {
  const key = [...cycle].sort().join('|');
  if (seen.has(key)) continue;
  seen.add(key);
  problems.push(
    `require cycle: ${cycle.join(' -> ')}\n    A cycle can leave a binding uninitialized where another module captures it.`,
  );
}

// ---------------------------------------------------------------------------
// 5. An app must not keep the kit's identifiers.
//
// Two apps sharing a bundle id cannot coexist on a device or in the stores, and
// a shared URL scheme means whichever app is installed last wins the deep link.
// These are the values that MUST differ per app; forgetting one is only
// discovered at submission, which is the worst possible moment.
//
// The kit itself legitimately holds the defaults, so it carries
// `kavickiTemplate: true` in package.json. Deleting that field is the first
// step of creating an app, and it is what turns this check on.
//
// The EAS projectId is in the list too: the kit commits its own real id
// (this repo is built and shipped from), so an app that keeps it would
// silently send its builds into the kit's EAS project.
//
// Not listed on purpose: the MMKV storage id and the Android channel id. Those
// live inside the app's own sandbox, so reusing them across apps is harmless.
// ---------------------------------------------------------------------------
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const isKit = pkg.kavickiTemplate === true;

if (!isKit) {
  const appConfig = readFileSync(join(root, 'app.config.ts'), 'utf8');
  const KIT_DEFAULTS = [
    { pattern: /const APP_NAME = 'Kavicki Starter Kit'/, what: "APP_NAME is still the kit's" },
    { pattern: /const APP_SLUG = 'kavicki-starter-kit'/, what: "APP_SLUG is still the kit's" },
    {
      pattern: /const APP_SCHEME = 'kavickistarter'/,
      what: "APP_SCHEME is still the kit's — deep links would collide",
    },
    {
      pattern: /const BUNDLE_ID = 'com\.kavicki\.starterkit'/,
      what: "BUNDLE_ID is still the kit's — two apps cannot share a bundle id in the stores",
    },
    {
      pattern: /projectId:\s*'d68b190b-270b-46bb-9b15-dc7289322c92'/,
      what:
        "extra.eas.projectId is still the kit's — builds would land in the kit's " +
        'EAS project. Run `eas init` and paste the printed id',
    },
  ];

  for (const { pattern, what } of KIT_DEFAULTS) {
    if (pattern.test(appConfig)) {
      problems.push(`app.config.ts: ${what}.`);
    }
  }

  if (pkg.name === 'kavicki-starter-kit') {
    problems.push('package.json: name is still the kit\'s ("kavicki-starter-kit").');
  }
}

// ---------------------------------------------------------------------------
// 6. Icon packages are imported by path, never through their barrel.
//
// A barrel pulls every icon into the bundle: `lucide-react-native` ships all
// ~1,900 icon modules, `@expo/vector-icons` all 11 fonts (4.4 MB) for one set
// in use. Nothing fails — the bundle is just several MB larger. Lucide icons
// are re-exported one by one from src/core/components/icons.ts.
// ---------------------------------------------------------------------------
const ICON_BARRELS = ['@expo/vector-icons', 'lucide-react-native'];

for (const file of files) {
  for (const barrel of ICON_BARRELS) {
    for (const line of valueImportsOf(file.text, barrel)) {
      problems.push(
        `${file.rel}: imports the ${barrel} barrel ("${line.trim()}"). ` +
          `Import the icon by path instead (e.g. '${barrel}/…').`,
      );
    }
  }
}

// ---------------------------------------------------------------------------

if (problems.length > 0) {
  console.error(
    `Invariant check failed (${problems.length}):\n` +
      problems.map((p) => `  - ${p}`).join('\n\n') +
      '\n',
  );
  process.exit(1);
}

console.log(`Invariant check passed: ${files.length} source files.`);
