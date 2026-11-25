export const FILTER_OPERATORS = ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'in', 'contains'] as const;

export type FilterOperator = (typeof FILTER_OPERATORS)[number];
