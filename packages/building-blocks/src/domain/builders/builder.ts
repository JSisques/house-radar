import { FieldIsRequiredException } from '../value-objects/field-is-required.exception';

/** Base for aggregate builders. Subclasses expose their required fields and implement `build()`. */
export abstract class Builder<TProduct> {
  protected abstract requiredFields(): Readonly<Record<string, unknown>>;

  /** Throws `FieldIsRequiredException` for the first required field that is null or undefined. */
  validate(): void {
    for (const [field, value] of Object.entries(this.requiredFields())) {
      if (value === null || value === undefined) throw new FieldIsRequiredException(field);
    }
  }

  abstract build(): TProduct;
}
