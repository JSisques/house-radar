import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, test } from 'node:test';

import { BUILDING_BLOCKS, runTurbo, strictErrorFixture } from './support.mjs';

const TIMEOUT = { timeout: 120_000 };
const scoped = ['run', 'build', 'typecheck', `--filter=${BUILDING_BLOCKS}`];
let cacheDir;

const freshCache = () => mkdtempSync(join(tmpdir(), 'house-radar-turbo-'));
const dryTasks = (args) => {
  const { status, output } = runTurbo([...args, '--dry=json'], { cacheDir });
  assert.equal(status, 0, output);
  return JSON.parse(output.slice(output.indexOf('{'))).tasks;
};

before(() => {
  cacheDir = freshCache();
  rmSync(strictErrorFixture, { force: true });
});

after(() => {
  rmSync(strictErrorFixture, { force: true });
  rmSync(cacheDir, { recursive: true, force: true });
});

test('graph covers every workspace and orders typecheck after dependency builds', TIMEOUT, () => {
  const tasks = dryTasks(['run', 'build', 'typecheck']);
  for (const id of [
    'docs#build',
    'docs#typecheck',
    `${BUILDING_BLOCKS}#build`,
    `${BUILDING_BLOCKS}#typecheck`,
  ]) {
    const task = tasks.find((candidate) => candidate.taskId === id);
    assert.ok(task, `missing task ${id}`);
    assert.ok(task.resolvedTaskDefinition.dependsOn.includes('^build'), id);
  }
});

test('lint tasks hash the shared eslint config', TIMEOUT, () => {
  const tasks = dryTasks(['run', 'lint']);
  for (const id of ['docs#lint', `${BUILDING_BLOCKS}#lint`]) {
    const task = tasks.find((candidate) => candidate.taskId === id);
    assert.ok(task, `missing task ${id}`);
    assert.ok(
      Object.keys(task.inputs).some((input) => input.endsWith('eslint.config.js')),
      `${id} does not hash eslint.config.js`,
    );
  }
});

test('second scoped run is served from the cache', TIMEOUT, () => {
  assert.ok(dryTasks(scoped).every((task) => task.cache.status === 'MISS'));
  const first = runTurbo(scoped, { cacheDir });
  assert.equal(first.status, 0, first.output);
  assert.ok(dryTasks(scoped).every((task) => task.cache.status === 'HIT'));
  const replay = runTurbo(scoped, { cacheDir });
  assert.equal(replay.status, 0, replay.output);
  assert.match(replay.output, /FULL TURBO/);
});

const strictFailure = {
  'strict implicit any fails typecheck naming the package': {
    source: 'export function untyped(value) { return value; }\n',
    code: /TS7006/,
  },
  'noUncheckedIndexedAccess is enforced': {
    source: 'const items: string[] = [];\nexport const first: string = items[0];\n',
    code: /TS2322/,
  },
};

for (const [name, { source, code }] of Object.entries(strictFailure)) {
  test(name, TIMEOUT, () => {
    const isolatedCache = freshCache();
    try {
      writeFileSync(strictErrorFixture, source);
      const { status, output } = runTurbo(
        ['run', 'typecheck', `--filter=${BUILDING_BLOCKS}`, '--force'],
        { cacheDir: isolatedCache },
      );
      assert.notEqual(status, 0, output);
      assert.match(output, /@house-radar\/building-blocks[#:]typecheck/);
      assert.match(output, code);
    } finally {
      rmSync(strictErrorFixture, { force: true });
      rmSync(isolatedCache, { recursive: true, force: true });
    }
    assert.equal(existsSync(strictErrorFixture), false);
  });
}
