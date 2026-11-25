import { describe, expect, it } from 'vitest';

import { ExceptionMappingRegistry } from './exception-mapping.registry.js';

class FooException extends Error {}
class SpecificFooException extends FooException {}
class UnknownException extends Error {}

describe('ExceptionMappingRegistry', () => {
  it('resolves the mapping registered for an exception', () => {
    const registry = new ExceptionMappingRegistry();
    registry.register([{ exception: FooException, status: 404, code: 'FOO_NOT_FOUND' }]);

    expect(registry.find(new FooException())).toEqual({
      exception: FooException,
      status: 404,
      code: 'FOO_NOT_FOUND',
    });
  });

  it('resolves subclasses through their registered parent', () => {
    const registry = new ExceptionMappingRegistry();
    registry.register([{ exception: FooException, status: 409, code: 'FOO_CONFLICT' }]);

    expect(registry.find(new SpecificFooException())?.code).toBe('FOO_CONFLICT');
  });

  it('prefers the most specific registered class', () => {
    const registry = new ExceptionMappingRegistry();
    registry.register([
      { exception: FooException, status: 409, code: 'GENERIC' },
      { exception: SpecificFooException, status: 422, code: 'SPECIFIC' },
    ]);

    expect(registry.find(new SpecificFooException())?.code).toBe('SPECIFIC');
  });

  it('returns undefined for unregistered exceptions', () => {
    expect(new ExceptionMappingRegistry().find(new UnknownException())).toBeUndefined();
  });
});
