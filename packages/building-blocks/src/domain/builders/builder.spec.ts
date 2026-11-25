import { describe, expect, it } from 'vitest';

import { FieldIsRequiredException } from '../value-objects/field-is-required.exception';
import { Builder } from './builder';
import type { IBuilderFactory } from './builder-factory';

class NameBuilder extends Builder<string> {
  private name: string | null = null;

  withName(name: string): this {
    this.name = name;
    return this;
  }

  protected requiredFields(): Record<string, unknown> {
    return { name: this.name };
  }

  build(): string {
    this.validate();
    return this.name as string;
  }
}

class NameBuilderFactory implements IBuilderFactory<NameBuilder> {
  create(): NameBuilder {
    return new NameBuilder();
  }
}

describe('Builder', () => {
  it('throws FieldIsRequiredException when a required field is missing', () => {
    const builder = new NameBuilder();
    expect(() => builder.validate()).toThrow(FieldIsRequiredException);
    expect(() => builder.validate()).toThrow('name');
  });

  it('builds once every required field is set', () => {
    expect(new NameBuilder().withName('x').build()).toBe('x');
  });

  it('a factory returns a fresh builder on every call', () => {
    const factory = new NameBuilderFactory();
    expect(factory.create()).not.toBe(factory.create());
  });
});
