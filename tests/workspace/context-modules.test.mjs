import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

import { repoRoot } from './support.mjs';

// architecture/conventions.md: module providers are grouped in named arrays.
const ALLOWED_PROVIDER_ARRAYS = [
  'COMMAND_HANDLERS',
  'QUERY_HANDLERS',
  'APPLICATION_SERVICES',
  'DOMAIN_BUILDER_FACTORIES',
  'INFRASTRUCTURE_MAPPERS',
  'INFRASTRUCTURE_REPOSITORIES',
  'INFRASTRUCTURE_ADAPTERS',
];
const CONTROLLERS_ARRAY = 'REST_CONTROLLERS';

/** Returns the text between the brackets that follow `key:` in the source, or null when the key is absent. */
function arrayBody(source, key) {
  const match = new RegExp(`\\b${key}:\\s*\\[`).exec(source);
  if (!match) return null;
  let depth = 1;
  const start = match.index + match[0].length;
  for (let i = start; i < source.length; i += 1) {
    if ('([{'.includes(source[i])) depth += 1;
    if (')]}'.includes(source[i])) depth -= 1;
    if (depth === 0) return source.slice(start, i);
  }
  throw new Error(`unbalanced brackets after "${key}:"`);
}

/** Splits an array body on its top-level commas. */
function entries(body) {
  const result = [];
  let depth = 0;
  let current = '';
  for (const char of body) {
    if ('([{'.includes(char)) depth += 1;
    if (')]}'.includes(char)) depth -= 1;
    if (char === ',' && depth === 0) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  if (current.trim() !== '') result.push(current.trim());
  return result;
}

/** Violations of the module convention found in one module's source. */
export function moduleViolations(source) {
  const violations = [];

  const providers = arrayBody(source, 'providers');
  for (const entry of providers === null ? [] : entries(providers)) {
    const spread = /^\.\.\.(\w+)(\(.*\))?$/s.exec(entry);
    const name = spread?.[1];
    const isNamedArray = spread && !spread[2] && ALLOWED_PROVIDER_ARRAYS.includes(name);
    const isOrmProviders = spread && spread[2] && name === 'contextOrmProviders';
    if (!isNamedArray && !isOrmProviders) {
      violations.push(`providers entry "${entry.replace(/\s+/g, ' ')}" must be a spread of a named array`);
    }
  }

  if (/\bcontrollers:/.test(source) && !new RegExp(`\\bcontrollers:\\s*${CONTROLLERS_ARRAY}\\b`).test(source)) {
    violations.push(`controllers must be ${CONTROLLERS_ARRAY}`);
  }

  for (const [, name] of source.matchAll(/^\s*const ([A-Z][A-Z_]+)\s*(?::\s*Provider\[\])?\s*=\s*\[/gm)) {
    if (![...ALLOWED_PROVIDER_ARRAYS, CONTROLLERS_ARRAY].includes(name)) {
      violations.push(`"${name}" is not a conventional provider array name`);
    }
  }

  return violations;
}

function contextModules() {
  const contexts = join(repoRoot, 'apps/api/src/contexts');
  return readdirSync(contexts, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) =>
      readdirSync(join(contexts, entry.name))
        .filter((file) => file.endsWith('.module.ts'))
        .map((file) => join(contexts, entry.name, file)),
    );
}

test('there are context modules to check', () => {
  assert.ok(contextModules().length >= 3, 'expected at least listings, ingestion and properties');
});

for (const file of contextModules()) {
  test(`${file.slice(repoRoot.length + 1).replaceAll('\\', '/')} groups providers in named arrays`, () => {
    assert.deepEqual(moduleViolations(readFileSync(file, 'utf8')), []);
  });
}

// The checker itself: it must reject what the convention forbids.
test('rejects inline providers, inline controllers and unknown array names', () => {
  const bad = `
    const HANDLERS: Provider[] = [A];
    @Module({
      controllers: [SomeController],
      providers: [Mapper, { provide: TOKEN, useClass: Repo }, ...INFRASTRUCTURE_ADAPTERS],
    })`;
  assert.equal(moduleViolations(bad).length, 4);
});

test('accepts named arrays, contextOrmProviders and REST_CONTROLLERS', () => {
  const good = `
    const COMMAND_HANDLERS: Provider[] = [A];
    const REST_CONTROLLERS = [B];
    @Module({
      controllers: REST_CONTROLLERS,
      providers: [...contextOrmProviders('x'), ...COMMAND_HANDLERS],
    })`;
  assert.deepEqual(moduleViolations(good), []);
});
