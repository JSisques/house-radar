import type { FilterOperator } from './filter-operator';
import type { FilterValue } from './filter-value';

export interface Filter {
  readonly field: string;
  readonly operator: FilterOperator;
  readonly value: FilterValue;
}
