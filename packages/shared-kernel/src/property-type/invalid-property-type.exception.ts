import { DomainException } from '@house-radar/building-blocks';

export class InvalidPropertyTypeException extends DomainException {
  constructor(reason: string) {
    super('INVALID_PROPERTY_TYPE', `Invalid property type: ${reason}`);
  }
}
