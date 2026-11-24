import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

import { repoRoot } from './support.mjs';

const WORKFLOW = '.github/workflows/ci.yml';
const CONVENTIONS = [
  'apps/docs/src/content/docs/architecture/conventions.md',
  'apps/docs/src/content/docs/es/architecture/conventions.md',
];

const readText = (relativePath) => readFileSync(join(repoRoot, relativePath), 'utf8');

// Returns the text of one job: from its `  <id>:` line up to the next job or the end of the file.
function jobBlock(workflow, id) {
  const lines = workflow.split(/\r?\n/);
  const start = lines.findIndex((line) => line === `  ${id}:`);
  assert.notEqual(start, -1, `job "${id}" is missing`);
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((line) => /^ {2}\S/.test(line));
  return rest.slice(0, end === -1 ? undefined : end).join('\n');
}

test('ci workflow exists and runs on every pull request and on push to main', () => {
  assert.ok(existsSync(join(repoRoot, WORKFLOW)), `${WORKFLOW} is missing`);
  const workflow = readText(WORKFLOW);
  assert.match(workflow, /^name: ci$/m);
  assert.match(workflow, /^ {2}pull_request:\s*$/m);
  assert.match(workflow, /^ {2}push:\s*\n {4}branches: \[main\]$/m);
  // Required checks must always report, so the triggers carry no path filter.
  assert.doesNotMatch(workflow, /paths:/);
});

test('ci workflow has least-privilege permissions and cancels superseded runs', () => {
  const workflow = readText(WORKFLOW);
  assert.match(workflow, /^permissions:\n {2}contents: read$/m);
  assert.match(workflow, /^concurrency:\n {2}group: ci-\$\{\{ github\.ref \}\}\n {2}cancel-in-progress: true$/m);
});

test('code job installs with cache and runs every check on the affected workspaces', () => {
  const job = jobBlock(readText(WORKFLOW), 'code');
  assert.match(job, /fetch-depth: 0/);
  assert.match(job, /uses: pnpm\/action-setup@v4/);
  assert.match(job, /node-version-file: \.nvmrc/);
  assert.match(job, /cache: pnpm/);
  assert.match(job, /pnpm install --frozen-lockfile/);
  assert.match(job, /pnpm format:check/);
  assert.match(job, /pnpm lint:root/);
  assert.match(job, /pnpm test:workspace/);
  assert.match(job, /turbo run lint typecheck test build --filter="\.\.\.\[\$\{BASE_REF\}\]"/);
});

test('code job compares against the pull request base and, on push, against the previous main tip', () => {
  const job = jobBlock(readText(WORKFLOW), 'code');
  assert.match(job, /^ {6}BASE_REF: \$\{\{ github\.event_name == 'pull_request' && /m);
  assert.match(job, /format\('origin\/\{0\}', github\.base_ref\)/);
  assert.match(job, /\|\| github\.event\.before \}\}/);
});

test('commits job runs commitlint over the pull request commits only', () => {
  const job = jobBlock(readText(WORKFLOW), 'commits');
  assert.match(job, /if: github\.event_name == 'pull_request'/);
  assert.match(job, /fetch-depth: 0/);
  assert.match(job, /pnpm install --frozen-lockfile/);
  assert.match(job, /commitlint --from "\$\{BASE_SHA\}" --to "\$\{HEAD_SHA\}"/);
  assert.match(job, /BASE_SHA: \$\{\{ github\.event\.pull_request\.base\.sha \}\}/);
  assert.match(job, /HEAD_SHA: \$\{\{ github\.event\.pull_request\.head\.sha \}\}/);
});

test('ci workflow never interpolates expressions inside a run script', () => {
  const lines = readText(WORKFLOW).split(/\r?\n/);
  let runIndent = -1;
  for (const line of lines) {
    const indent = line.length - line.trimStart().length;
    if (runIndent !== -1 && line.trim() !== '' && indent <= runIndent) runIndent = -1;
    if (/^\s*(- )?run:/.test(line)) runIndent = indent;
    if (runIndent !== -1) {
      assert.doesNotMatch(line, /\$\{\{/, `expression interpolated in a run script: ${line.trim()}`);
    }
  }
});

test('conventions document the required check names in English and Spanish', () => {
  for (const path of CONVENTIONS) {
    const text = readText(path);
    assert.match(text, /`code`/, `${path} must name the required check "code"`);
    assert.match(text, /`commits`/, `${path} must name the required check "commits"`);
    assert.match(text, /`\.github\/workflows\/ci\.yml`/, `${path} must mention the ci workflow file`);
  }
});
