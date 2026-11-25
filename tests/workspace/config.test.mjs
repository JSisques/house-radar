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

test('base tsconfig declares the path aliases through configDir', () => {
  const { compilerOptions } = readJson('tsconfig.base.json');
  assert.deepEqual(compilerOptions.paths, {
    '@contexts/*': ['${configDir}/src/contexts/*'],
    '@core/*': ['${configDir}/src/core/*'],
    '@shared/*': ['${configDir}/src/shared/*'],
  });
  assert.equal(compilerOptions.baseUrl, undefined);
});

test('lint fixtures tsconfig extends the base', () => {
  assert.equal(readJson('tests/lint-fixtures/tsconfig.json').extends, '../../tsconfig.base.json');
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
  const lines = readText('pnpm-workspace.yaml')
    .split('\n')
    .map((line) => line.trim().replaceAll('"', "'"));
  assert.ok(lines.includes("- 'apps/*'"));
  assert.ok(lines.includes("- 'packages/*'"));
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
    test: 'vitest run',
    'test:integration': 'vitest run --config vitest.integration.config.ts',
    lint: 'eslint .',
  });
  for (const entry of ['.', './package-marker']) {
    for (const target of Object.values(pkg.exports[entry])) {
      assert.ok(target.startsWith('./dist/'), entry);
    }
  }
  assert.equal(pkg.dependencies, undefined);
  for (const version of Object.values(pkg.devDependencies)) {
    assert.match(version, /^\d+\.\d+\.\d+$/);
  }
});

test('building-blocks tsconfigs extend the strict base', () => {
  assert.equal(readJson(`${BB}/tsconfig.json`).extends, '../../tsconfig.base.json');
  const build = readJson(`${BB}/tsconfig.build.json`);
  assert.equal(build.extends, './tsconfig.json');
  assert.equal(build.compilerOptions.outDir, 'dist');
  // tsc has no brace expansion, so every spec kind gets its own glob.
  assert.deepEqual(build.exclude, [
    'src/**/*.spec.ts',
    'src/**/*.spec.tsx',
    'src/**/*.integration-spec.ts',
    'src/**/*.e2e-spec.ts',
  ]);
});

test('root pins vitest and its v8 coverage provider on the same exact version', () => {
  const { devDependencies, scripts } = readJson('package.json');
  assert.match(devDependencies.vitest ?? '', /^\d+\.\d+\.\d+$/);
  assert.match(devDependencies['@vitest/coverage-v8'] ?? '', /^\d+\.\d+\.\d+$/);
  assert.equal(devDependencies.vitest, devDependencies['@vitest/coverage-v8']);
  assert.equal(scripts['test:integration'], 'turbo run test:integration');
});

test('turbo test tasks hash the shared vitest config; integration is never cached', () => {
  const { tasks } = readJson('turbo.json');
  for (const task of ['test', 'test:integration']) {
    assert.deepEqual(tasks[task].dependsOn, ['^build'], task);
    assert.ok(tasks[task].inputs.includes('$TURBO_DEFAULT$'), task);
    assert.ok(tasks[task].inputs.includes('$TURBO_ROOT$/vitest.shared.ts'), task);
    assert.deepEqual(tasks[task].outputs, [], task);
  }
  // Integration specs depend on external services whose state turbo cannot hash.
  assert.equal(tasks['test:integration'].cache, false);
  assert.equal(tasks.test.cache, undefined);
});

test('root vitest config lists package projects and shares coverage', () => {
  const text = readText('vitest.config.ts');
  assert.ok(text.includes("'packages/*/vitest.config.ts'"));
  assert.ok(text.includes("'apps/*/vitest.config.ts'"));
  assert.ok(existsSync(join(repoRoot, 'vitest.shared.ts')));
});

test('vitest scratch package wires one unit and one integration config', () => {
  const pkg = readJson('packages/vitest-scratch/package.json');
  assert.equal(pkg.name, '@house-radar/vitest-scratch');
  assert.equal(pkg.private, true);
  assert.equal(pkg.type, 'module');
  assert.deepEqual(pkg.scripts, {
    typecheck: 'tsc --noEmit',
    test: 'vitest run',
    'test:integration': 'vitest run --config vitest.integration.config.ts',
    lint: 'eslint .',
  });
  assert.equal(readJson('packages/vitest-scratch/tsconfig.json').extends, '../../tsconfig.base.json');
  for (const file of ['vitest.config.ts', 'vitest.integration.config.ts']) {
    assert.ok(existsSync(join(repoRoot, 'packages/vitest-scratch', file)), file);
    assert.ok(existsSync(join(repoRoot, BB, file)), `${BB}/${file}`);
  }
});

test('building-blocks exposes a barrel file and keeps the package marker', () => {
  assert.ok(existsSync(join(repoRoot, BB, 'src/index.ts')));
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

test('root pins prettier 3.x exactly', () => {
  const { devDependencies } = readJson('package.json');
  assert.match(devDependencies.prettier ?? '', /^\d+\.\d+\.\d+$/);
  assert.equal(devDependencies.prettier.split('.')[0], '3');
});

test('format scripts run prettier directly, outside turbo', () => {
  const { scripts } = readJson('package.json');
  assert.equal(scripts.format, 'prettier --write .');
  assert.equal(scripts['format:check'], 'prettier --check .');
  assert.equal(scripts.format.includes('turbo'), false);
  assert.equal(scripts['format:check'].includes('turbo'), false);
});

test('.prettierrc freezes the three formatting options', () => {
  assert.deepEqual(readJson('.prettierrc'), { singleQuote: true, trailingComma: 'all', printWidth: 120 });
});

test('.prettierignore lists the additions on top of .gitignore', () => {
  const lines = readText('.prettierignore')
    .split('\n')
    .map((line) => line.trim());
  for (const entry of [
    'pnpm-lock.yaml',
    'openspec/',
    'odd/',
    'tests/lint-fixtures/',
    'apps/docs/design/',
    '*.md',
    '*.mdx',
  ]) {
    assert.ok(lines.includes(entry), entry);
  }
});

test('commitlint packages are exact-pinned on the same major', () => {
  const { devDependencies } = readJson('package.json');
  const cli = devDependencies['@commitlint/cli'] ?? '';
  const preset = devDependencies['@commitlint/config-conventional'] ?? '';
  assert.match(cli, /^\d+\.\d+\.\d+$/);
  assert.match(preset, /^\d+\.\d+\.\d+$/);
  assert.equal(cli.split('.')[0], preset.split('.')[0]);
});

test('commitlint config extends the conventional preset only', async () => {
  const { default: config } = await import(join(repoRoot, 'commitlint.config.js'));
  assert.deepEqual(config, { extends: ['@commitlint/config-conventional'] });
});

test('husky and lint-staged are exact-pinned, husky on major 9', () => {
  const { devDependencies } = readJson('package.json');
  assert.match(devDependencies.husky ?? '', /^\d+\.\d+\.\d+$/);
  assert.equal(devDependencies.husky.split('.')[0], '9');
  assert.match(devDependencies['lint-staged'] ?? '', /^\d+\.\d+\.\d+$/);
});

test('prepare installs husky and test:changed runs affected build and test', () => {
  const { scripts } = readJson('package.json');
  assert.equal(scripts.prepare, 'husky');
  assert.equal(scripts.prepare.includes('turbo'), false);
  assert.equal(scripts['test:changed'], 'turbo run build test --affected');
});

test('lint-staged runs eslint before prettier on disjoint globs without git commands', () => {
  const config = readJson('package.json')['lint-staged'];
  assert.deepEqual(config, {
    '*.{js,mjs,cjs,ts,tsx,mts,cts}': ['eslint --fix --no-warn-ignored', 'prettier --write'],
    '*.{json,jsonc,yaml,yml,css}': 'prettier --write --ignore-unknown',
  });
  const serialized = JSON.stringify(config);
  assert.equal(serialized.includes('git '), false);
  for (const ext of ['md', 'mdx', 'sh']) {
    assert.equal(
      Object.keys(config).some((glob) => glob.includes(ext)),
      false,
      ext,
    );
  }
});

test('husky hooks have the frozen bodies', () => {
  assert.equal(readText('.husky/pre-commit').trim(), 'lint-staged');
  assert.equal(readText('.husky/commit-msg').trim(), 'commitlint --edit "$1"');
  const prePush = readText('.husky/pre-push');
  assert.equal(prePush.trim(), 'pnpm test:changed');
  assert.equal(prePush.includes('test:workspace'), false);
});
