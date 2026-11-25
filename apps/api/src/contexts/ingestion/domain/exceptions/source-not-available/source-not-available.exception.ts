import { DomainException } from '@house-radar/building-blocks';

export class SourceNotAvailableException extends DomainException {
  constructor(sourceId: string) {
    super('SOURCE_NOT_AVAILABLE', `Source "${sourceId}" does not exist or is disabled`);
  }
}
