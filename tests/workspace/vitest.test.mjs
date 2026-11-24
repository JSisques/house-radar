import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import { after, test } from 'node:test';

import { runBin, runTurbo, SCRATCH, scratchDir } from './support.mjs';

const failingFixture = join(scratchDir, 'src/__workspace_fixture_failing.spec.ts');
const scratchRoots = [];

after(() => {
  rmSync(failingFixture, { force: true });
  for (const dir of scratchRoots) rmSync(dir, { recursive: true, force: true });
});

function freshDir() {
  const dir = mkdtempSync(join(tmpdir(), 'house-radar-vitest-'));
  scratchRoots.push(dir);
  return dir;
}

// Runs vitest inside the scratch package and returns the spec files it executed.
function discovered(extraArgs = []) {
  // Vitest 5's json reporter writes to a file, so point it outside the worktree.
  const outputFile = join(freshDir(), 'report.json');
  const { status, stderr } = runBin('vitest', ['run', '--reporter=json', `--outputFile=${outputFile}`, ...extraArgs], {
    cwd: scratchDir,
  });
  assert.equal(status, 0, stderr);
  const report = JSON.parse(readFileSync(outputFile, 'utf8'));
  return report.testResults.map((result) => basename(result.name)).sort();
}

test('pnpm test discovers *.spec.ts and *.spec.tsx and skips integration and e2e specs', () => {
  assert.deepEqual(discovered(), ['greeting.spec.ts', 'greeting.spec.tsx']);
});

test('test:integration runs only *.integration-spec.ts', () => {
  assert.deepEqual(discovered(['--config', 'vitest.integration.config.ts']), ['greeting.integration-spec.ts']);
});

test('e2e specs are reserved by name and run by neither task', () => {
  const all = [...discovered(), ...discovered(['--config', 'vitest.integration.config.ts'])];
  assert.equal(
    all.some((file) => file.endsWith('.e2e-spec.ts')),
    false,
  );
});

test('a failing spec makes the turbo test task exit non-zero', () => {
  writeFileSync(
    failingFixture,
    "import { expect, it } from 'vitest';\n\nit('fails on purpose', () => {\n  expect(1).toBe(2);\n});\n",
  );
  const { status, output } = runTurbo(['run', 'test', `--filter=${SCRATCH}`, '--force'], { cacheDir: freshDir() });
  assert.notEqual(status, 0, output);
  assert.match(output, /fails on purpose/);
});

test('turbo test succeeds on the scratch package once the failing spec is gone', () => {
  rmSync(failingFixture, { force: true });
  const { status, output } = runTurbo(['run', 'test', `--filter=${SCRATCH}`, '--force'], { cacheDir: freshDir() });
  assert.equal(status, 0, output);
});

test('turbo test:integration never replays from cache', () => {
  const cacheDir = freshDir();
  const args = ['run', 'test:integration', `--filter=${SCRATCH}`];
  assert.equal(runTurbo(args, { cacheDir }).status, 0);
  const second = runTurbo(args, { cacheDir });
  assert.equal(second.status, 0, second.output);
  assert.equal(second.output.includes('FULL TURBO'), false);
});
