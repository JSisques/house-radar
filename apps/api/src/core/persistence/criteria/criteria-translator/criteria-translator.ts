import type { Criteria, FilterOperator } from '@house-radar/building-blocks';

const OPERATORS: Readonly<Record<FilterOperator, string>> = {
  eq: '$eq',
  neq: '$ne',
  gt: '$gt',
  gte: '$gte',
  lt: '$lt',
  lte: '$lte',
  in: '$in',
  contains: '$like',
};

export interface TranslatedCriteria {
  where: Record<string, Record<string, unknown>>;
  orderBy: Record<string, 'asc' | 'desc'>[];
  limit: number;
  offset: number;
}

/**
 * Translates read-side `Criteria` into MikroORM query parts. `columns` maps each public field to its row property;
 * validating the fields is the job of the context's `FilterFieldRegistry`.
 */
export function translateCriteria(
  criteria: Criteria,
  columns: Readonly<Record<string, string>>,
  defaultPageSize: number,
): TranslatedCriteria {
  const where: TranslatedCriteria['where'] = {};
  for (const { field, operator, value } of criteria.filters) {
    const column = columns[field] as string;
    where[column] = {
      ...where[column],
      [OPERATORS[operator]]: operator === 'contains' ? `%${String(value)}%` : value,
    };
  }
  const page = criteria.pagination?.page ?? 1;
  const limit = criteria.pagination?.pageSize ?? defaultPageSize;
  return {
    where,
    orderBy: criteria.sorts.map(({ field, direction }) => ({ [columns[field] as string]: direction })),
    limit,
    offset: (page - 1) * limit,
  };
}
