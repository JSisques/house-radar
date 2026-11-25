import { DomainException } from '@house-radar/building-blocks';

export class SourceNotAvailableException extends DomainException {
  constructor(kind: string) {
    super('SOURCE_NOT_AVAILABLE', `No enabled source of kind "${kind}" exists`);
  }
}
