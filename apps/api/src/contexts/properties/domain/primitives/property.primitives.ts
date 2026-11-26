export interface IListingReferencePrimitives {
  listingId: string;
  version: number;
}

export interface IPropertyPrimitives {
  id: string;
  listings: IListingReferencePrimitives[];
}
