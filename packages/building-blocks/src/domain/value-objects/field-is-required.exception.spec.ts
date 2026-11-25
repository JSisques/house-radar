import { describe, expect, it } from 'vitest';

import { DomainException } from './domain.exception';
import { FieldIsRequiredException } from './field-is-required.exception';

describe('FieldIsRequiredException', () => {
  it('is a domain exception naming the missing field', () => {
    const error = new FieldIsRequiredException('title');

    expect(error).toBeInstanceOf(DomainException);
    expect(error.code).toBe('FIELD_IS_REQUIRED');
    expect(error.message).toBe('Field is required: title');
    expect(error.field).toBe('title');
  });
});
