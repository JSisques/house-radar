import { builtinModules } from 'node:module';
import { join } from 'node:path';

import js from '@eslint/js';
import boundaries from 'eslint-plugin-boundaries';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const root = import.meta.dirname;
const TS_FILES = ['**/*.{ts,tsx,mts,cts}'];

// Layers follow the conventions' Layers table. `adapter` is declared before
// `infrastructure` because boundaries assigns the first matching descriptor.
const elements = [
  { type: 'adapter', pattern: 'contexts/*/infrastructure/adapters', capture: ['context'] },
  { type: 'domain', pattern: 'contexts/*/domain', capture: ['context'] },
  { type: 'application', pattern: 'contexts/*/application', capture: ['context'] },
  { type: 'infrastructure', pattern: 'contexts/*/infrastructure', capture: ['context'] },
  { type: 'transport', pattern: 'contexts/*/transport', capture: ['context'] },
  { type: 'core', pattern: 'core' },
  { type: 'shared', pattern: 'shared' },
];

const sameContext = { captured: { context: '{{ from.element.captured.context }}' } };
const allow = (from, ...targets) => ({
  from: { element: { type: from } },
  allow: { to: { element: targets } },
});

const dependencyPolicies = [
  allow('domain', { type: 'domain', ...sameContext }),
  allow('application', { types: ['application', 'domain'], ...sameContext }),
  allow(
    'infrastructure',
    { types: ['infrastructure', 'adapter', 'application', 'domain'], ...sameContext },
    { types: ['core', 'shared'] },
  ),
  allow(
    'adapter',
    { types: ['adapter', 'infrastructure'], ...sameContext },
    { types: ['application', 'domain'] },
    { types: ['core', 'shared'] },
  ),
  allow(
    'transport',
    { types: ['transport', 'application', 'domain'], ...sameContext },
    { types: ['core', 'shared'] },
  ),
  allow('core', { types: ['core', 'shared'] }),
  allow('shared', { types: ['shared', 'core'] }),
];

export default [
  {
    ignores: ['**/dist/**', '**/.astro/**', '**/.turbo/**', '**/coverage/**', 'tests/lint-fixtures/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended.map((config) => ({ ...config, files: TS_FILES })),
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: { globals: globals.node },
  },
  {
    files: TS_FILES,
    rules: { '@typescript-eslint/no-explicit-any': 'error' },
  },
  {
    plugins: { boundaries, 'simple-import-sort': simpleImportSort },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          // Absolute paths keep resolution independent of the cwd.
          project: [
            join(root, 'tests/lint-fixtures/tsconfig.json'), // test fixtures only
            join(root, 'packages/*/tsconfig.json'),
            join(root, 'apps/*/tsconfig.json'),
          ],
        },
      },
      'boundaries/elements': elements,
    },
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '^\\.\\.(/|$)',
              message: 'Parent-relative imports are not allowed; import from the same directory or use a package.',
            },
          ],
        },
      ],
      'boundaries/dependencies': ['error', { default: 'disallow', policies: dependencyPolicies }],
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^\\u0000'], // side-effect imports
            ['^node:', `^(${builtinModules.join('|')})(/|$)`], // Node built-ins
            ['^@?\\w'], // external packages
            ['^@house-radar(/.*|$)'], // workspace packages
            ['^@(contexts|core|shared)(/.*|$)'], // internal aliases
            ['^\\.'], // same-directory relative
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
    },
  },
];
