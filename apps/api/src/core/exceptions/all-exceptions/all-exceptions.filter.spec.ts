import { describe, expect, it } from 'vitest';

import { DomainException } from '@house-radar/building-blocks';

import { AllExceptionsFilter } from '@core/exceptions/all-exceptions/all-exceptions.filter.js';
import { ExceptionMappingRegistry } from '@core/exceptions/exception-mapping/exception-mapping.registry.js';

class ConflictException extends DomainException {
  constructor(readonly reference: string) {
    super('CONFLICT', 'already there');
  }
}

const respond = (error: unknown, registry: ExceptionMappingRegistry) => {
  let status = 0;
  let body: unknown;
  const response = {
    status: (code: number) => {
      status = code;
      return { json: (value: unknown) => (body = value) };
    },
  };
  const host = { switchToHttp: () => ({ getResponse: () => response }) };
  new AllExceptionsFilter(registry).catch(error, host as never);
  return { status, body };
};

describe('AllExceptionsFilter details', () => {
  it('adds the mapping details to the body when the mapping defines them', () => {
    const registry = new ExceptionMappingRegistry();
    registry.register([
      {
        exception: ConflictException,
        status: 409,
        code: 'CONFLICT',
        details: (e) => ({ reference: (e as ConflictException).reference }),
      },
    ]);

    expect(respond(new ConflictException('abc'), registry)).toEqual({
      status: 409,
      body: { statusCode: 409, code: 'CONFLICT', message: 'already there', details: { reference: 'abc' } },
    });
  });

  it('keeps the body unchanged when the mapping has no details', () => {
    const registry = new ExceptionMappingRegistry();
    registry.register([{ exception: ConflictException, status: 409, code: 'CONFLICT' }]);

    expect(respond(new ConflictException('abc'), registry).body).toEqual({
      statusCode: 409,
      code: 'CONFLICT',
      message: 'already there',
    });
  });
});
