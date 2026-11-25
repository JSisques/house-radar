import type { Criteria } from '../criteria/criteria';
import type { FilterOperator } from '../filter/filter-operator';
import { InvalidFilterFieldException } from './invalid-filter-field.exception';

/** Whitelist of the fields a context lets callers filter and sort on, with the operators each accepts. */
export class FilterFieldRegistry {
  private readonly fields: ReadonlyMap<string, readonly FilterOperator[]>;

  constructor(fields: Readonly<Record<string, readonly FilterOperator[]>>) {
    this.fields = new Map(Object.entries(fields));
  }

  has(field: string): boolean {
    return this.fields.has(field);
  }

  /** Throws `InvalidFilterFieldException` when a filter or sort uses an unknown field or a disallowed operator. */
  assertAllowed(criteria: Criteria): void {
    for (const { field, operator } of criteria.filters) {
      const operators = this.fields.get(field);
      if (operators === undefined) throw new InvalidFilterFieldException(`unknown field "${field}"`);
      if (!operators.includes(operator)) {
        throw new InvalidFilterFieldException(`operator "${operator}" is not allowed on "${field}"`);
      }
    }
    for (const { field } of criteria.sorts) {
      if (!this.fields.has(field)) throw new InvalidFilterFieldException(`unknown field "${field}"`);
    }
  }
}
