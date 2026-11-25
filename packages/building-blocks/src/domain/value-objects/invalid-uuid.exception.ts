import { DomainException } from './domain.exception';

export class InvalidUuidException extends DomainException {
  constructor(reason: string) {
    super('INVALID_UUID', `Invalid UUID: ${reason}`);
  }
}
