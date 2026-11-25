import { describe, expect, it } from 'vitest';

import { DomainException } from './domain.exception';

class SampleException extends DomainException {
  constructor(cause?: unknown) {
    super('SAMPLE', 'sample failure', { cause });
  }
}

describe('DomainException', () => {
  it('carries a code and a message', () => {
    const error = new SampleException();

    expect(error).toBeInstanceOf(Error);
    expect(error.code).toBe('SAMPLE');
    expect(error.message).toBe('sample failure');
    expect(error.name).toBe('SampleException');
  });

  it('carries an optional cause', () => {
    const cause = new Error('root');

    expect(new SampleException(cause).cause).toBe(cause);
    expect(new SampleException().cause).toBeUndefined();
  });
});
