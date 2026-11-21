import assert from 'node:assert/strict';
import { test } from 'node:test';

import { comparePages } from './i18n-parity.mjs';

test('reports no issues when every default page has a translation', () => {
  const result = comparePages(['index.mdx', 'adr/d00.md'], ['index.mdx', 'adr/d00.md']);

  assert.deepEqual(result, { missing: [], orphaned: [] });
});

test('reports default pages without a translation as missing', () => {
  const result = comparePages(['index.mdx', 'adr/d00.md', 'adr/d01.md'], ['index.mdx']);

  assert.deepEqual(result.missing, ['adr/d00.md', 'adr/d01.md']);
});

test('reports translations without a default page as orphaned', () => {
  const result = comparePages(['index.mdx'], ['index.mdx', 'product/old.md']);

  assert.deepEqual(result.orphaned, ['product/old.md']);
});

test('treats md and mdx variants of the same slug as equivalent', () => {
  const result = comparePages(['index.mdx'], ['index.md']);

  assert.deepEqual(result, { missing: [], orphaned: [] });
});
