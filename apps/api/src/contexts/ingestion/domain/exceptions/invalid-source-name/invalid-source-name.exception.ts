import { DomainException } from '@house-radar/building-blocks';

export class InvalidSourceNameException extends DomainException {
  constructor(reason: string) {
    super('INVALID_SOURCE_NAME', `Invalid source name: ${reason}`);
  }
}
