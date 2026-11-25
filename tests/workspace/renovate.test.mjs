import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, test } from 'node:test';

import { readJson, repoRoot, runBin } from './support.mjs';

const CONFIG = 'renovate.json';
const CONVENTIONS = [
  'apps/docs/src/content/docs/architecture/conventions.md',
  'apps/docs/src/content/docs/es/architecture/conventions.md',
];

const scratch = mkdtempSync(join(tmpdir(), 'renovate-'));
after(() => rmSync(scratch, { recursive: true, force: true }));

const validate = (path) => runBin('renovate-config-validator', ['--strict', path], { cwd: scratch });

test('renovate.json exists and passes renovate-config-validator', () => {
  assert.ok(existsSync(join(repoRoot, CONFIG)), `${CONFIG} is missing`);
  const { status, stdout, stderr } = validate(join(repoRoot, CONFIG));
  assert.equal(status, 0, `${stdout}${stderr}`);
});

test('renovate-config-validator rejects an invalid config', () => {
  const invalid = join(scratch, 'renovate.json');
  writeFileSync(invalid, JSON.stringify({ extends: ['config:recommended'], notAnOption: true }));
  const { status } = validate(invalid);
  assert.notEqual(status, 0);
});

test('renovate extends config:recommended and keeps exact pins', () => {
  const config = readJson(CONFIG);
  assert.deepEqual(config.extends, ['config:recommended']);
  assert.equal(config.rangeStrategy, 'pin');
});

test('renovate commits are Conventional Commits that pass commitlint', () => {
  const config = readJson(CONFIG);
  assert.equal(config.semanticCommits, 'enabled');
  assert.equal(config.semanticCommitType, 'chore');
  assert.equal(config.semanticCommitScope, 'deps');
  const { status, stderr } = runBin('commitlint', [], { input: 'chore(deps): update dependency typescript to v6' });
  assert.equal(status, 0, stderr);
});

test('renovate runs weekly with a dashboard and lockfile maintenance', () => {
  const config = readJson(CONFIG);
  assert.ok(Array.isArray(config.schedule) && config.schedule.length > 0);
  assert.equal(config.dependencyDashboard?.enabled, true);
  assert.equal(config.lockFileMaintenance?.enabled, true);
});

test('renovate automerges non-major updates but never majors or 0.x versions', () => {
  const rule = (readJson(CONFIG).packageRules ?? []).find((r) => r.automerge === true);
  assert.ok(rule, 'an automerge rule is missing');
  assert.deepEqual(rule.matchUpdateTypes, ['minor', 'patch', 'pin', 'digest']);
  assert.ok(!rule.matchUpdateTypes.includes('major'));
  assert.equal(rule.matchCurrentVersion, '!/^0/');
});

test('renovate groups packages released together', () => {
  const rules = readJson(CONFIG).packageRules ?? [];
  const group = (name) => rules.find((rule) => rule.groupName === name);
  assert.ok(group('typescript-eslint')?.matchPackageNames?.some((p) => p.includes('typescript-eslint')));
  assert.ok(group('commitlint')?.matchPackageNames?.includes('@commitlint/**'));
  const astro = group('astro');
  assert.ok(astro?.matchPackageNames?.includes('astro'));
  assert.ok(astro?.matchPackageNames?.includes('@astrojs/starlight'));
});

test('renovate updates packageManager, engines and GitHub Actions without pinning engines', () => {
  const config = readJson(CONFIG);
  const rules = config.packageRules ?? [];
  const engines = rules.find((rule) => rule.matchDepTypes?.includes('engines'));
  assert.ok(engines, 'engines need their own rule');
  assert.notEqual(engines.rangeStrategy, 'pin');
  assert.notEqual(engines.enabled, false);
  assert.ok(!(config.enabledManagers && !config.enabledManagers.includes('github-actions')));
  assert.ok(!(config.enabledManagers && !config.enabledManagers.includes('npm')));
});

test('conventions Tooling section documents the Renovate policy in EN and ES', () => {
  for (const file of CONVENTIONS) {
    const text = readFileSync(join(repoRoot, file), 'utf8');
    assert.match(text, /Renovate/, `${file} does not mention Renovate`);
    assert.match(text, /renovate\.json/, `${file} does not mention renovate.json`);
  }
});
