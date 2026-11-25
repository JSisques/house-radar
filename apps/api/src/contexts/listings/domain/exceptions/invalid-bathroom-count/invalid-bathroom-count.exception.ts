import { DomainException } from '@house-radar/building-blocks';

export class InvalidBathroomCountException extends DomainException {
  constructor(reason: string) {
    super('INVALID_BATHROOM_COUNT', `Invalid bathroom count: ${reason}`);
  }
}
