import { DomainException } from '@house-radar/building-blocks';

export class InvalidExternalIdException extends DomainException {
  constructor(reason: string) {
    super('INVALID_EXTERNAL_ID', `Invalid external id: ${reason}`);
  }
}
