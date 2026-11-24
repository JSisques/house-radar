import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, test } from 'node:test';

import { repoRoot, runBin, runTurbo } from './support.mjs';

const git = (...args) => spawnSync('git', args, { cwd: repoRoot, encoding: 'utf8' });

// First of origin/main, main that resolves to a commit other than HEAD; CI checks out
// origin/main only, and on a push to main both equal HEAD (no diff to compare).
const diffBase = () => {
  const head = git('rev-parse', 'HEAD').stdout.trim();
  for (const ref of ['origin/main', 'main']) {
    const rev = git('rev-parse', '--verify', '--quiet', `${ref}^{commit}`);
    if (rev.status === 0 && rev.stdout.trim() !== head) return ref;
  }
  return null;
};

const PROBE = 'tests/workspace/__probe__.ts';

const prettierStdin = (input, extraArgs = []) =>
  runBin('prettier', ['--stdin-filepath', PROBE, ...extraArgs], { input });

const fileInfo = (path) => {
  const { status, stdout, stderr } = runBin('prettier', ['--file-info', path]);
  assert.equal(status, 0, stderr);
  return JSON.parse(stdout);
};

test('prettier applies single quotes and semicolons', () => {
  assert.equal(prettierStdin('const a = "x"').stdout, "const a = 'x';\n");
  assert.equal(prettierStdin('const b = "y y";\n').stdout, "const b = 'y y';\n");
});

test('prettier keeps a ~100 character call on one line (printWidth 120, not 80)', () => {
  const call = `doSomething('${'a'.repeat(40)}', '${'b'.repeat(40)}');\n`;
  assert.ok(call.length > 90 && call.length < 120, String(call.length));
  assert.equal(prettierStdin(call).stdout, call);
});

test('prettier adds trailing commas to multi-line literals past 120 characters', () => {
  const items = Array.from({ length: 6 }, (_, i) => `'${String(i).repeat(25)}'`);
  const output = prettierStdin(`const xs = [${items.join(', ')}];\n`).stdout;
  assert.match(output, /,\n\];\n$/);
  assert.equal(output.split('\n').length, 9);
});

test('prettier --check fails on unformatted input and passes on formatted input', () => {
  assert.notEqual(prettierStdin('const a = "x"', ['--check']).status, 0);
  assert.equal(prettierStdin("const a = 'x';\n", ['--check']).status, 0);
});

test('prettier ignores lockfile, openspec, odd, fixtures, markdown and gitignored paths', () => {
  for (const path of [
    'pnpm-lock.yaml',
    'openspec/x.yaml',
    'odd/x.json',
    'tests/lint-fixtures/src/misc/sibling.ts',
    'apps/docs/design/x.html',
    'apps/docs/design/folla-catastral/Main.dc.html',
    'docs.md',
    'page.mdx',
    'apps/docs/dist/x.js',
    '.turbo/x.json',
  ]) {
    assert.equal(fileInfo(path).ignored, true, path);
  }
});

test('prettier handles source and config files and skips unknown types', () => {
  for (const path of ['eslint.config.js', 'package.json']) {
    const info = fileInfo(path);
    assert.equal(info.ignored, false, path);
    assert.notEqual(info.inferredParser, null, path);
  }
  assert.equal(fileInfo('requirements.txt').inferredParser, null);
});

test('commitlint rejects a non-conventional message', () => {
  const { status, stdout, stderr } = runBin('commitlint', [], { input: 'update stuff\n' });
  assert.notEqual(status, 0);
  assert.match(`${stdout}${stderr}`, /type-empty/);
  assert.match(`${stdout}${stderr}`, /subject-empty/);
});

test('commitlint accepts a conventional message', () => {
  const { status, stdout, stderr } = runBin('commitlint', [], { input: 'feat(api): add x\n' });
  assert.equal(status, 0, `${stdout}${stderr}`);
  assert.equal(runBin('commitlint', [], { input: 'fix: handle null\n' }).status, 0);
});

test('eslint step blocks an unfixable staged file', () => {
  const { status, stdout, stderr } = runBin(
    'eslint',
    ['--no-warn-ignored', '--fix-dry-run', '--stdin', '--stdin-filename', PROBE],
    { input: 'export type Loose = any;\n' },
  );
  assert.equal(status, 1);
  assert.match(`${stdout}${stderr}`, /@typescript-eslint\/no-explicit-any/);
});

test('eslint step stays silent for a globally ignored staged file', () => {
  const { status, stdout, stderr } = runBin('eslint', [
    '--no-warn-ignored',
    'tests/lint-fixtures/src/misc/explicit-any.ts',
  ]);
  assert.equal(status, 0);
  assert.equal(`${stdout}${stderr}`, '');
});

const scratchDirs = [];
const scratch = () => {
  const dir = mkdtempSync(join(tmpdir(), 'house-radar-husky-'));
  scratchDirs.push(dir);
  return dir;
};
after(() => scratchDirs.forEach((dir) => rmSync(dir, { recursive: true, force: true })));

test('husky install exits 0 without .git and with HUSKY=0, creating nothing', () => {
  for (const env of [{}, { HUSKY: '0' }]) {
    const cwd = scratch();
    const { status, stdout, stderr } = runBin('husky', [], { cwd, env });
    assert.equal(status, 0, `${stdout}${stderr}`);
    assert.equal(existsSync(join(cwd, '.husky', '_')), false);
  }
});

test('turbo --affected schedules build and test for every workspace against a resolvable base', (t) => {
  const base = diffBase();
  if (!base) return t.skip('no main ref that differs from HEAD');
  const cacheDir = scratch();
  const { status, output } = runTurbo(['run', 'build', 'test', '--affected', '--dry=json'], {
    cacheDir,
    env: { TURBO_SCM_BASE: base },
  });
  assert.equal(status, 0, output);
  const tasks = JSON.parse(output.slice(output.indexOf('{'))).tasks;
  const ids = tasks.map((task) => task.taskId);
  for (const id of [
    'docs#build',
    'docs#test',
    '@house-radar/building-blocks#build',
    '@house-radar/building-blocks#test',
  ]) {
    assert.ok(ids.includes(id), id);
  }
  assert.ok(tasks.every((task) => ['build', 'test'].includes(task.task)));
});
