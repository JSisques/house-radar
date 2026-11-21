import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

import { ESLint } from 'eslint';

import { repoRoot } from './support.mjs';

// Canonical dependency rule of eslint-plugin-boundaries 7.x (element-types is deprecated).
const BOUNDARIES_RULE = 'boundaries/dependencies';
const NO_RELATIVE_PARENT = 'no-restricted-imports';
const FIXTURES = join(repoRoot, 'tests/lint-fixtures/src');
const LISTINGS = 'contexts/listings';

// `ignore: false` lets the suite lint the fixtures that normal lint ignores.
const eslint = new ESLint({ cwd: repoRoot, ignore: false });
const sortFixer = new ESLint({
  cwd: repoRoot,
  ignore: false,
  fix: (message) => message.ruleId?.startsWith('simple-import-sort/') ?? false,
});

const fixturePath = (relativePath) => join(FIXTURES, relativePath);

async function ruleIds(relativePath, instance = eslint) {
  const [result] = await instance.lintFiles([fixturePath(relativePath)]);
  return result.messages.map((message) => message.ruleId).sort();
}

test('domain importing infrastructure is rejected by boundaries (AC1)', async () => {
  assert.deepEqual(await ruleIds(`${LISTINGS}/domain/imports-infrastructure.ts`), [
    BOUNDARIES_RULE,
    NO_RELATIVE_PARENT,
  ]);
});

test('application importing another context is rejected by boundaries', async () => {
  assert.deepEqual(await ruleIds(`${LISTINGS}/application/imports-other-context.ts`), [
    BOUNDARIES_RULE,
    NO_RELATIVE_PARENT,
  ]);
});

test('same-directory relative imports are allowed', async () => {
  assert.deepEqual(await ruleIds(`${LISTINGS}/domain/same-dir-relative.ts`), []);
});

test('inward and adapter cross-context imports pass boundaries', async () => {
  for (const file of [
    `${LISTINGS}/application/uses-domain.ts`,
    `${LISTINGS}/infrastructure/uses-domain.ts`,
    `${LISTINGS}/infrastructure/adapters/pricing.adapter.ts`,
  ]) {
    const ids = await ruleIds(file);
    assert.deepEqual(ids, [NO_RELATIVE_PARENT], file);
    assert.equal(ids.some((id) => id.startsWith('boundaries/')), false, file);
  }
});

test('parent-relative imports are rejected (AC2)', async () => {
  assert.deepEqual(await ruleIds('misc/nested/parent-relative.ts'), [NO_RELATIVE_PARENT]);
});

test('explicit any is rejected (AC4)', async () => {
  assert.deepEqual(await ruleIds('misc/explicit-any.ts'), ['@typescript-eslint/no-explicit-any']);
});

test('unsorted imports are rejected (AC3)', async () => {
  assert.deepEqual(await ruleIds('misc/unsorted-imports.ts'), ['simple-import-sort/imports']);
});

const EXPECTED_SORTED = `import { readFileSync } from 'node:fs';

import { something } from 'some-package';

import { marker } from '@house-radar/building-blocks/package-marker';

import { sibling } from './sibling';

export { marker, readFileSync, sibling, something };
`;

test('import sort fix is computed in memory and never written to disk', async () => {
  const file = fixturePath('misc/unsorted-imports.ts');
  const before = readFileSync(file, 'utf8');
  const [result] = await sortFixer.lintFiles([file]);
  assert.equal(result.output, EXPECTED_SORTED);
  assert.equal(readFileSync(file, 'utf8'), before);
});

test('normal lint ignores the fixtures', async () => {
  const normal = new ESLint({ cwd: repoRoot });
  assert.equal(await normal.isPathIgnored(fixturePath('misc/explicit-any.ts')), true);
});
