import { DomainException } from '@house-radar/building-blocks';

export class InvalidPropertyConditionException extends DomainException {
  constructor(reason: string) {
    super('INVALID_PROPERTY_CONDITION', `Invalid property condition: ${reason}`);
  }
}
