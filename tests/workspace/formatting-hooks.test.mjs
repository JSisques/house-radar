import assert from 'node:assert/strict';
import { test } from 'node:test';

import { runBin } from './support.mjs';

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
