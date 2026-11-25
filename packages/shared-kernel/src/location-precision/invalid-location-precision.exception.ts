import { DomainException } from '@house-radar/building-blocks';

export class InvalidLocationPrecisionException extends DomainException {
  constructor(reason: string) {
    super('INVALID_LOCATION_PRECISION', `Invalid location precision: ${reason}`);
  }
}
