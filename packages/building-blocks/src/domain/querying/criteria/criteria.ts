import type { Filter } from '../filter/filter';
import type { Pagination } from '../pagination/pagination';
import type { Sort } from '../sort/sort';

interface CriteriaProps {
  filters?: readonly Filter[];
  sorts?: readonly Sort[];
  pagination?: Pagination | null;
}

/** Immutable query description. Every `add*` / `paginate` method returns a new instance. */
export class Criteria {
  readonly filters: readonly Filter[];
  readonly sorts: readonly Sort[];
  readonly pagination: Pagination | null;

  constructor(props: CriteriaProps = {}) {
    this.filters = Object.freeze([...(props.filters ?? [])]);
    this.sorts = Object.freeze([...(props.sorts ?? [])]);
    this.pagination = props.pagination ? Object.freeze({ ...props.pagination }) : null;
    Object.freeze(this);
  }

  addFilter(filter: Filter): Criteria {
    return new Criteria({ ...this, filters: [...this.filters, filter] });
  }

  addSort(sort: Sort): Criteria {
    return new Criteria({ ...this, sorts: [...this.sorts, sort] });
  }

  paginate(pagination: Pagination): Criteria {
    return new Criteria({ ...this, pagination });
  }
}
