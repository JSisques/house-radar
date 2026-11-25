import { DomainException } from '@house-radar/building-blocks';

export class InvalidLandTypeException extends DomainException {
  constructor(reason: string) {
    super('INVALID_LAND_TYPE', `Invalid land type: ${reason}`);
  }
}
