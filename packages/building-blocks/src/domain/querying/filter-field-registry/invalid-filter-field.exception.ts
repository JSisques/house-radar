import { DomainException } from '../../value-objects/domain.exception';

export class InvalidFilterFieldException extends DomainException {
  constructor(reason: string) {
    super('INVALID_FILTER_FIELD', `Invalid filter field: ${reason}`);
  }
}
