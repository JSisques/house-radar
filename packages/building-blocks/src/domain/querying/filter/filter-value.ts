/** Values a filter can carry. There is deliberately no `any` and no `unknown` here. */
export type FilterValue = string | number | boolean | Date | null | readonly (string | number)[];
