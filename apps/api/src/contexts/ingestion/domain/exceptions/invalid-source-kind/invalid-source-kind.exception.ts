import { DomainException } from '@house-radar/building-blocks';

export class InvalidSourceKindException extends DomainException {
  constructor(reason: string) {
    super('INVALID_SOURCE_KIND', `Invalid source kind: ${reason}`);
  }
}
