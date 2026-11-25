import { DomainException } from '@house-radar/building-blocks';

export class InvalidAreaException extends DomainException {
  constructor(reason: string) {
    super('INVALID_AREA', `Invalid area: ${reason}`);
  }
}
