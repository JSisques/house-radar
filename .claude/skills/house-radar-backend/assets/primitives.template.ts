// Path: src/contexts/<context>/domain/primitives/<name>.primitives.ts
// Plain serializable shape of an aggregate. Money is in cents; unknown-aware fields use MaybePrimitives.
export interface IListingPrimitives {
  id: string;
  sourceUrl: string;
  title: string;
  priceCents: number;
}
