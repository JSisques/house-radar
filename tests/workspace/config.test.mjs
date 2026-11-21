import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

import { readJson, repoRoot } from './support.mjs';

const BB = 'packages/building-blocks';
const readText = (relativePath) => readFileSync(join(repoRoot, relativePath), 'utf8');

test('root package.json defines turbo task scripts', () => {
  const { scripts } = readJson('package.json');
  for (const task of ['build', 'dev', 'lint', 'test', 'typecheck']) {
    assert.equal(scripts[task], `turbo run ${task}`);
  }
  assert.equal(scripts['test:workspace'], "node --test --test-concurrency=1 'tests/workspace/*.test.mjs'");
});

test('root pins turbo 2.x and typescript exactly', () => {
  const { devDependencies } = readJson('package.json');
  assert.match(devDependencies.turbo, /^2\.\d+\.\d+$/);
  assert.equal(devDependencies.typescript, '5.9.3');
});

// Characterization guard: green by design, protects docs.yml compatibility.
test('docs scripts stay unchanged and docs gains typecheck', () => {
  const { scripts } = readJson('package.json');
  assert.equal(scripts['docs:dev'], 'pnpm --filter docs dev');
  assert.equal(scripts['docs:build'], 'pnpm --filter docs build');
  assert.equal(scripts['docs:check'], 'pnpm --filter docs exec astro check');
  assert.equal(scripts['docs:test'], 'pnpm --filter docs test');
  assert.equal(scripts['docs:check-i18n'], 'pnpm --filter docs check:i18n');
  const docs = readJson('apps/docs/package.json').scripts;
  assert.equal(docs.typecheck, 'astro check');
  assert.equal(docs.dev, 'astro dev');
  assert.equal(docs.build, 'astro build');
  assert.equal(docs.test, "node --test 'scripts/*.test.mjs'");
  assert.equal(docs.lint, 'eslint .');
});

test('pnpm workspace lists apps and packages globs', () => {
  const lines = readText('pnpm-workspace.yaml').split('\n').map((line) => line.trim());
  assert.ok(lines.includes('- "apps/*"'));
  assert.ok(lines.includes('- "packages/*"'));
});

test('turbo.json defines the task graph', () => {
  const turbo = readJson('turbo.json');
  assert.ok(turbo.tasks);
  assert.equal(turbo.pipeline, undefined);
  for (const task of ['build', 'typecheck', 'test']) {
    assert.deepEqual(turbo.tasks[task].dependsOn, ['^build']);
  }
  assert.deepEqual(turbo.tasks.build.outputs, ['dist/**']);
  assert.equal(turbo.tasks.dev.cache, false);
  assert.equal(turbo.tasks.dev.persistent, true);
  assert.ok(turbo.globalDependencies.includes('tsconfig.base.json'));
});

test('tsconfig.base.json is strict', () => {
  const { compilerOptions } = readJson('tsconfig.base.json');
  assert.deepEqual(
    {
      target: compilerOptions.target,
      module: compilerOptions.module,
      moduleResolution: compilerOptions.moduleResolution,
      strict: compilerOptions.strict,
      noUncheckedIndexedAccess: compilerOptions.noUncheckedIndexedAccess,
      isolatedModules: compilerOptions.isolatedModules,
      skipLibCheck: compilerOptions.skipLibCheck,
      declaration: compilerOptions.declaration,
    },
    {
      target: 'ES2022',
      module: 'ESNext',
      moduleResolution: 'Bundler',
      strict: true,
      noUncheckedIndexedAccess: true,
      isolatedModules: true,
      skipLibCheck: true,
      declaration: true,
    },
  );
  assert.equal('experimentalDecorators' in compilerOptions, false);
  assert.equal('emitDecoratorMetadata' in compilerOptions, false);
});

test('building-blocks manifest is a private ESM package with exact pins', () => {
  const pkg = readJson(`${BB}/package.json`);
  assert.equal(pkg.name, '@house-radar/building-blocks');
  assert.equal(pkg.private, true);
  assert.equal(pkg.type, 'module');
  assert.equal(pkg.version, '0.0.0');
  assert.deepEqual(pkg.scripts, {
    build: 'tsc -p tsconfig.build.json',
    typecheck: 'tsc --noEmit',
    test: 'vitest run --passWithNoTests',
    lint: 'eslint .',
  });
  assert.equal('.' in pkg.exports, false);
  for (const target of Object.values(pkg.exports['./package-marker'])) {
    assert.ok(target.startsWith('./dist/'));
  }
  for (const version of Object.values(pkg.devDependencies)) {
    assert.match(version, /^\d+\.\d+\.\d+$/);
  }
});

test('building-blocks tsconfigs extend the strict base', () => {
  assert.equal(readJson(`${BB}/tsconfig.json`).extends, '../../tsconfig.base.json');
  const build = readJson(`${BB}/tsconfig.build.json`);
  assert.equal(build.extends, './tsconfig.json');
  assert.equal(build.compilerOptions.outDir, 'dist');
});

test('building-blocks has no barrel file', () => {
  assert.equal(existsSync(join(repoRoot, BB, 'src/index.ts')), false);
  assert.ok(existsSync(join(repoRoot, BB, 'src/package-marker.ts')));
});

test('gitignore covers build output, turbo cache and test fixtures', () => {
  const lines = readText('.gitignore').split('\n');
  for (const pattern of ['dist/', '.turbo/', '__workspace_fixture_*']) {
    assert.ok(lines.includes(pattern), pattern);
  }
});

const LINT_TOOLCHAIN = [
  'eslint',
  '@eslint/js',
  'typescript-eslint',
  'eslint-plugin-boundaries',
  'eslint-plugin-simple-import-sort',
  'eslint-import-resolver-typescript',
  'globals',
];

test('root pins the lint toolchain exactly and keeps @eslint/js on the eslint major', () => {
  const { devDependencies } = readJson('package.json');
  for (const name of LINT_TOOLCHAIN) {
    assert.match(devDependencies[name] ?? '', /^\d+\.\d+\.\d+$/, name);
  }
  // @eslint/js is versioned independently since 10.x; only the major must match.
  assert.equal(devDependencies.eslint.split('.')[0], devDependencies['@eslint/js'].split('.')[0]);
});

test('lint:root lints root files outside turbo', () => {
  const { scripts } = readJson('package.json');
  assert.equal(scripts['lint:root'], 'eslint tests eslint.config.js');
  assert.equal(scripts['lint:root'].includes('turbo'), false);
});

test('turbo lint task hashes the shared eslint config without building', () => {
  const { lint } = readJson('turbo.json').tasks;
  assert.ok(lint.inputs.includes('$TURBO_DEFAULT$'));
  assert.ok(lint.inputs.includes('$TURBO_ROOT$/eslint.config.js'));
  assert.equal(lint.dependsOn, undefined);
  assert.deepEqual(lint.outputs, []);
});

test('workspaces use the root eslint config and define none of their own', () => {
  assert.ok(existsSync(join(repoRoot, 'eslint.config.js')));
  const skipped = new Set(['node_modules', 'dist', '.astro', '.turbo']);
  const stray = [];
  const walk = (dir) => {
    for (const entry of readdirSync(join(repoRoot, dir), { withFileTypes: true })) {
      if (entry.isDirectory() && !skipped.has(entry.name)) walk(`${dir}/${entry.name}`);
      else if (entry.isFile() && /^eslint\.config\./.test(entry.name)) stray.push(`${dir}/${entry.name}`);
    }
  };
  walk('apps');
  walk('packages');
  assert.deepEqual(stray, []);
});
