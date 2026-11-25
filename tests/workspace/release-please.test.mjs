import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

import { repoRoot } from './support.mjs';

const readJson = (relativePath) => JSON.parse(readFileSync(join(repoRoot, relativePath), 'utf8'));

const config = readJson('release-please-config.json');
const manifest = readJson('.release-please-manifest.json');

// Every package.json in the workspace: the root plus one per directory under apps/ and packages/.
function workspaceManifests() {
  const found = ['package.json'];
  for (const group of ['apps', 'packages']) {
    for (const entry of readdirSync(join(repoRoot, group), { withFileTypes: true })) {
      const path = `${group}/${entry.name}/package.json`;
      if (entry.isDirectory() && existsSync(join(repoRoot, path))) found.push(path);
    }
  }
  return found;
}

test('release-please manages the whole monorepo as one component with one changelog', () => {
  assert.deepEqual(Object.keys(config.packages), ['.']);
  assert.equal(config['include-component-in-tag'], false);
  assert.equal(config['changelog-path'], 'CHANGELOG.md');
  assert.equal(config['separate-pull-requests'] ?? false, false);
});

test('release-please bumps the version of every workspace package.json through globs', () => {
  const extraFiles = config.packages['.']['extra-files'] ?? [];
  // The root package.json is bumped natively by the node release type.
  assert.equal(config['release-type'], 'node');
  for (const path of ['apps/*/package.json', 'packages/*/package.json']) {
    const entry = extraFiles.find((file) => file.path === path);
    assert.ok(entry, `extra-files has no entry for ${path}`);
    assert.equal(entry.type, 'json');
    assert.equal(entry.jsonpath, '$.version');
    assert.equal(entry.glob, true);
  }
});

test('every package.json carries the version recorded in the release manifest', () => {
  const version = manifest['.'];
  for (const path of workspaceManifests()) {
    assert.equal(readJson(path).version, version, `${path} is out of sync with the manifest`);
  }
});
