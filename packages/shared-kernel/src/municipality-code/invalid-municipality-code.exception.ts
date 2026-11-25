import { DomainException } from '@house-radar/building-blocks';

export class InvalidMunicipalityCodeException extends DomainException {
  constructor(reason: string) {
    super('INVALID_MUNICIPALITY_CODE', `Invalid municipality code: ${reason}`);
  }
}
