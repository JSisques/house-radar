import { DomainException } from '@house-radar/building-blocks';

export class InvalidSourceIdException extends DomainException {
  constructor(reason: string) {
    super('INVALID_SOURCE_ID', `Invalid source id: ${reason}`);
  }
}
