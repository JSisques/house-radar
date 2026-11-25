import { DomainException } from '@house-radar/building-blocks';

export class InvalidBedroomCountException extends DomainException {
  constructor(reason: string) {
    super('INVALID_BEDROOM_COUNT', `Invalid bedroom count: ${reason}`);
  }
}
