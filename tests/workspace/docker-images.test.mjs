import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

import { repoRoot } from './support.mjs';

const WORKFLOW = '.github/workflows/publish-images.yml';
const IMAGES = ['api', 'ingestion', 'web'];

const readText = (relativePath) => readFileSync(join(repoRoot, relativePath), 'utf8');
const dockerfile = (app) => `apps/${app}/Dockerfile`;

for (const app of IMAGES) {
  test(`${app} has a multi-stage Dockerfile with a healthcheck`, () => {
    assert.ok(existsSync(join(repoRoot, dockerfile(app))), `${dockerfile(app)} is missing`);
    const text = readText(dockerfile(app));
    assert.ok((text.match(/^FROM /gm) ?? []).length >= 2, 'expected at least two build stages');
    assert.match(text, /^HEALTHCHECK /m);
  });
}

test('node services run as a non-root user and start dist/main.js', () => {
  for (const app of ['api', 'ingestion']) {
    const text = readText(dockerfile(app));
    assert.match(text, /^USER node$/m, `${app} must not run as root`);
    assert.match(text, /dist\/main\.js/);
  }
});

test('healthchecks target the endpoints the services expose', () => {
  assert.match(readText(dockerfile('api')), /:3000\/api\/health/);
  assert.match(readText(dockerfile('ingestion')), /:3001\/health/);
  assert.match(readText(dockerfile('web')), /\/version\.json/);
});

test('web image writes /version.json with the commit SHA it was built from', () => {
  const text = readText(dockerfile('web'));
  assert.match(text, /^ARG GIT_SHA$/m);
  assert.match(text, /version\.json/);
  assert.match(text, /"sha"/);
});

test('.dockerignore keeps secrets, git history and build output out of the context', () => {
  assert.ok(existsSync(join(repoRoot, '.dockerignore')), '.dockerignore is missing');
  const lines = readText('.dockerignore').split(/\r?\n/);
  for (const entry of ['.git', '**/node_modules', '**/dist', '.env', '.env.*']) {
    assert.ok(lines.includes(entry), `.dockerignore must list ${entry}`);
  }
});

test('publish workflow pushes to GHCR on main and on release tags', () => {
  assert.ok(existsSync(join(repoRoot, WORKFLOW)), `${WORKFLOW} is missing`);
  const workflow = readText(WORKFLOW);
  assert.match(workflow, /^name: publish-images$/m);
  assert.match(workflow, /branches: \[main\]/);
  assert.match(workflow, /tags: \['v\*'\]/);
  assert.match(workflow, /ghcr\.io/);
  assert.match(workflow, /^ {2}packages: write$/m);
  assert.match(workflow, /docker\/login-action@v3/);
  assert.match(workflow, /docker\/build-push-action@v6/);
});

test('publish workflow tags images with sha-<commit> and the release version', () => {
  const workflow = readText(WORKFLOW);
  assert.match(workflow, /type=sha,prefix=sha-,format=long/);
  assert.match(workflow, /type=semver,pattern=\{\{version\}\}/);
  assert.match(workflow, /app: \[api, ingestion, web\]/);
  assert.match(workflow, /file: apps\/\$\{\{ matrix\.app \}\}\/Dockerfile/);
  assert.match(workflow, /GIT_SHA=\$\{\{ github\.sha \}\}/);
});
