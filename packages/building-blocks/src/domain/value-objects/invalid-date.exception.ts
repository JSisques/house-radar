import { DomainException } from './domain.exception';

export class InvalidDateException extends DomainException {
  constructor(reason: string) {
    super('INVALID_DATE', `Invalid date: ${reason}`);
  }
}
