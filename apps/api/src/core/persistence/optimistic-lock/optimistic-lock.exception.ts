import { DomainException } from '@house-radar/building-blocks';

/** The aggregate changed in the database after it was loaded (or its row is gone): the save was rejected. */
export class OptimisticLockException extends DomainException {
  constructor(aggregateType: string, aggregateId: string, options: { cause?: unknown } = {}) {
    super('OPTIMISTIC_LOCK_CONFLICT', `${aggregateType} ${aggregateId} was modified by someone else`, options);
  }
}
