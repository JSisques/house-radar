import { DomainException } from './domain.exception';

export class FieldIsRequiredException extends DomainException {
  readonly field: string;

  constructor(field: string) {
    super('FIELD_IS_REQUIRED', `Field is required: ${field}`);
    this.field = field;
  }
}
