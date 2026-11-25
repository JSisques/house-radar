import { DomainException } from '../domain.exception';

export class InvalidBooleanException extends DomainException {
  constructor(reason: string) {
    super('INVALID_BOOLEAN', `Invalid boolean: ${reason}`);
  }
}
