import { DomainException } from '@house-radar/building-blocks';

export class InvalidYearBuiltException extends DomainException {
  constructor(reason: string) {
    super('INVALID_YEAR_BUILT', `Invalid year built: ${reason}`);
  }
}
