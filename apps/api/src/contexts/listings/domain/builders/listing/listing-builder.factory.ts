import type { IBuilderFactory } from '@house-radar/building-blocks';

import { ListingBuilder } from '@contexts/listings/domain/builders/listing/listing.builder';

export const LISTING_BUILDER_FACTORY_TOKEN = Symbol('LISTING_BUILDER_FACTORY');

export type IListingBuilderFactory = IBuilderFactory<ListingBuilder>;

export class ListingBuilderFactory implements IListingBuilderFactory {
  create(): ListingBuilder {
    return new ListingBuilder();
  }
}
