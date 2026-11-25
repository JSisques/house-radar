import { DomainException } from './domain.exception';

export class InvalidNumberException extends DomainException {
  constructor(reason: string) {
    super('INVALID_NUMBER', `Invalid number: ${reason}`);
  }
}
