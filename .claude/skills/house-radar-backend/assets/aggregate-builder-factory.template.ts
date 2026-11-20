// Path: src/contexts/<context>/domain/builders/<name>/<name>-builder.factory.ts
// Builders are stateful, so they are never providers. The factory is stateless,
// so it is the provider: inject it and call create() on every execution.
// Framework-free: no @Injectable(). It is registered in the module with
// { provide: LISTING_BUILDER_FACTORY_TOKEN, useClass: ListingBuilderFactory }.
import { IBuilderFactory } from '@house-radar/building-blocks';

import { ListingBuilder } from '@contexts/listings/domain/builders/listing/listing.builder';

export const LISTING_BUILDER_FACTORY_TOKEN = Symbol('LISTING_BUILDER_FACTORY');

export type IListingBuilderFactory = IBuilderFactory<ListingBuilder>;

export class ListingBuilderFactory implements IListingBuilderFactory {
  create(): ListingBuilder {
    return new ListingBuilder();
  }
}
