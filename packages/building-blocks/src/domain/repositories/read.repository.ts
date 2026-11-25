import type { Criteria } from '../querying/criteria/criteria';
import type { PaginatedResult } from '../querying/paginated-result';

/** Read port, separate from the write port. Returns read models, never aggregates. */
export interface IReadRepository<TId, TView> {
  findById(id: TId): Promise<TView | null>;
  findByCriteria(criteria: Criteria): Promise<PaginatedResult<TView>>;
}
