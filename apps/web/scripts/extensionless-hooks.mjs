// Node ESM needs explicit file extensions, but the workspace packages are compiled for bundlers
// (`moduleResolution: Bundler`) and emit extensionless relative imports. This hook retries those
// specifiers with `.js` and `/index.js` so the API can run from `dist` just to emit its OpenAPI document.
const RETRYABLE = new Set(['ERR_MODULE_NOT_FOUND', 'ERR_UNSUPPORTED_DIR_IMPORT']);

export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (error) {
    if (!specifier.startsWith('.') || !RETRYABLE.has(error.code)) throw error;
    for (const suffix of ['.js', '/index.js']) {
      try {
        return await nextResolve(`${specifier}${suffix}`, context);
      } catch {
        // try the next candidate
      }
    }
    throw error;
  }
}
