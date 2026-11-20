// Path: src/contexts/<context>/domain/primitives/<name>.primitives.ts
export interface IListingPrimitives {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  sourceUrl: string;
  title: string;
  price: { amountCents: number; currency: 'EUR' };
}
