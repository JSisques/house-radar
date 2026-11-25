import { DomainException } from '@house-radar/building-blocks';

export class InvalidGeoPointException extends DomainException {
  constructor(reason: string) {
    super('INVALID_GEO_POINT', `Invalid geo point: ${reason}`);
  }
}
