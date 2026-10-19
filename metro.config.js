const { getDefaultConfig } = require('expo/metro-config');

/**
 * Metro config.
 *
 * Web is only a layout preview for this app (the stores ship iOS and
 * Android), but a preview with real data is what lets every screen be looked
 * at without a device. `expo-sqlite` runs on web through a WebAssembly build
 * in a worker, which needs:
 *
 * - `.wasm` served as an asset;
 * - cross-origin isolation (COOP/COEP), for the SharedArrayBuffer its
 *   synchronous API uses.
 *
 * Neither affects the native builds.
 */
const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('wasm');

config.server.enhanceMiddleware = (middleware) => (req, res, next) => {
  res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  return middleware(req, res, next);
};

module.exports = config;
