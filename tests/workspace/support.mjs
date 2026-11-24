import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

export const BUILDING_BLOCKS = '@house-radar/building-blocks';

export const strictErrorFixture = join(repoRoot, 'packages/building-blocks/src/__workspace_fixture_strict_error__.ts');

export function readJson(relativePath) {
  return JSON.parse(readFileSync(join(repoRoot, relativePath), 'utf8'));
}

export const SCRATCH = '@house-radar/vitest-scratch';

export const scratchDir = join(repoRoot, 'packages/vitest-scratch');

// Windows only ships `.cmd` shims for node_modules/.bin entries and needs a shell to run them.
const isWindows = process.platform === 'win32';

function binPath(root, name) {
  return join(root, 'node_modules/.bin', isWindows ? `${name}.cmd` : name);
}

export function runTurbo(args, { cacheDir, env = {} }) {
  const result = spawnSync(binPath(repoRoot, 'turbo'), args, {
    shell: isWindows,
    cwd: repoRoot,
    encoding: 'utf8',
    timeout: 120_000,
    maxBuffer: 32 * 1024 * 1024,
    env: {
      ...process.env,
      TURBO_CACHE_DIR: cacheDir,
      TURBO_TELEMETRY_DISABLED: '1',
      TURBO_NO_UPDATE_NOTIFIER: '1',
      DO_NOT_TRACK: '1',
      ...env,
    },
  });
  return { status: result.status, output: `${result.stdout ?? ''}${result.stderr ?? ''}` };
}

// `root` selects which node_modules/.bin to use; vitest is only linked inside the packages that depend on it.
export function runBin(name, args, { input, cwd = repoRoot, env = {}, root = repoRoot } = {}) {
  const result = spawnSync(binPath(root, name), args, {
    shell: isWindows,
    cwd,
    input,
    encoding: 'utf8',
    timeout: 120_000,
    maxBuffer: 32 * 1024 * 1024,
    env: { ...process.env, ...env },
  });
  return { status: result.status, stdout: result.stdout ?? '', stderr: result.stderr ?? '' };
}
