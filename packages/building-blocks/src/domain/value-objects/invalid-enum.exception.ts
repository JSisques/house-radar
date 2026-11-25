import { DomainException } from './domain.exception';

export class InvalidEnumException extends DomainException {
  constructor(reason: string) {
    super('INVALID_ENUM', `Invalid enum: ${reason}`);
  }
}
