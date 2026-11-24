import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

import { repoRoot } from './support.mjs';

const readText = (relativePath) => readFileSync(join(repoRoot, relativePath), 'utf8');

// .gitattributes: text=auto eol=lf; .bat/.cmd keep CRLF
test('gitattributes defines LF normalization and Windows-script CRLF', () => {
  const attr = readText('.gitattributes');
  assert.ok(attr.includes('* text=auto eol=lf'), 'must normalize all text to LF');
  assert.ok(attr.includes('*.bat text eol=crlf'), '.bat must keep CRLF');
  assert.ok(attr.includes('*.cmd text eol=crlf'), '.cmd must keep CRLF');
});

// .editorconfig: end_of_line = lf, indent_size = 2
test('editorconfig enforces LF, 2-space indent, final newline', () => {
  const config = readText('.editorconfig');
  assert.ok(config.includes('end_of_line = lf'), 'must enforce LF');
  assert.ok(config.includes('indent_size = 2'), 'must use 2-space indent');
  assert.ok(config.includes('insert_final_newline = true'), 'must require final newline');
});

// CI workflow runs on PR and push to main
test('CI workflow runs on pull_request and push to main', () => {
  const yml = readText('.github/workflows/ci.yml');
  assert.ok(yml.includes('pull_request:'), 'CI must run on pull requests');
  assert.ok(yml.includes('push:') && yml.includes('branches:'), 'CI must run on push');
  assert.ok(yml.includes('main'), 'CI push target must be main');
});

// CI workflow has code and commits jobs
test('CI workflow defines code and commits jobs', () => {
  const yml = readText('.github/workflows/ci.yml');
  assert.ok(/^[ ]{2}code:/m.test(yml), 'CI must have code job');
  assert.ok(/^[ ]{2}commits:/m.test(yml), 'CI must have commits job');
});

// CI commits job only runs on PRs
test('CI commits job is gated on pull_request', () => {
  const yml = readText('.github/workflows/ci.yml');
  const lines = yml.split('\n');
  const commitsIdx = lines.findIndex((l) => l === '  commits:');
  assert.notEqual(commitsIdx, -1, 'commits job must exist');
  // Next non-empty line after "commits:" should be the if: condition
  const nextLine = lines[commitsIdx + 1];
  assert.ok(nextLine.includes('if:') && nextLine.includes('pull_request'), 'commits job must be gated on pull_request');
});

// CI uses commitlint in the commits job
test('CI commits job runs commitlint', () => {
  const yml = readText('.github/workflows/ci.yml');
  // commits is the last job, so grab from "commits:" to end of string
  const commitsJob = yml.match(/commits:.*$/ms);
  assert.ok(commitsJob, 'commits job exists');
  assert.ok(commitsJob[0].includes('commitlint'), 'commits job must run commitlint');
});

// Conventions doc documents CI checks
test('conventions document CI required checks', () => {
  const en = readText('apps/docs/src/content/docs/architecture/conventions.md');
  assert.ok(en.includes('required checks'), 'must document required checks');
  assert.ok(en.includes('`code`') && en.includes('`commits`'), 'must list code and commits');
  const es = readText('apps/docs/src/content/docs/es/architecture/conventions.md');
  assert.ok(es.includes('checks requeridos'), 'ES doc must document required checks');
  assert.ok(es.includes('`code`') && es.includes('`commits`'), 'ES doc must list code and commits');
});
