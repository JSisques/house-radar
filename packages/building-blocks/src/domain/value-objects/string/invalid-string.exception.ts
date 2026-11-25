import { DomainException } from '../domain.exception';

export class InvalidStringException extends DomainException {
  constructor(reason: string) {
    super('INVALID_STRING', `Invalid string: ${reason}`);
  }
}
