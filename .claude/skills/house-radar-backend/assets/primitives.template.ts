// Path: src/contexts/<context>/domain/primitives/<name>.primitives.ts
export interface IListingPrimitives {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  price: { amountCents: number; currency: 'EUR' };
}
