import type { IProcessedEventRepository } from '@contexts/properties/application/ports/processed-event-repository.port';
import type { IProjectedListingRepository } from '@contexts/properties/application/ports/projected-listing-repository.port';
import type { IPropertySearchViewRepository } from '@contexts/properties/application/ports/property-search-view-repository.port';
import type { ITransactionManager } from '@contexts/properties/application/ports/transaction-manager.port';
import { PropertySearchViewRefresherService } from '@contexts/properties/application/services/property-search-view-refresher/property-search-view-refresher.service';
import type { IProjectedListingProps } from '@contexts/properties/domain/interfaces/projected-listing-props.interface';
import type { IPropertySearchViewPrimitives } from '@contexts/properties/domain/primitives/property-search-view.primitives';

/** In-memory ports that behave like the real ones, so handler specs can read back the view they produced. */
export function createInMemoryProjection(propertyOfListing: Record<string, string>) {
  const claims = new Set<string>();
  const listings = new Map<string, IProjectedListingProps>();
  const views = new Map<string, IPropertySearchViewPrimitives>();

  const empty = (listingId: string): IProjectedListingProps => ({
    listingId,
    source: null,
    status: null,
    priceCents: null,
    attributes: null,
    attributesObservedAt: null,
  });

  const processedEvents: IProcessedEventRepository = {
    claim: (eventId, consumer) => {
      const key = `${eventId}:${consumer}`;
      if (claims.has(key)) return Promise.resolve(false);
      claims.add(key);
      return Promise.resolve(true);
    },
  };
  const projectedListings: IProjectedListingRepository = {
    applyImported: (command) => {
      listings.set(command.listingId.value, {
        ...(listings.get(command.listingId.value) ?? empty(command.listingId.value)),
        source: command.source,
        status: command.status,
        priceCents: command.priceCents,
        attributes: command.attributes,
        attributesObservedAt: command.observedAt,
      });
      return Promise.resolve();
    },
    applyObserved: (command) => {
      listings.set(command.listingId.value, {
        ...(listings.get(command.listingId.value) ?? empty(command.listingId.value)),
        status: command.status,
        priceCents: command.priceCents,
      });
      return Promise.resolve();
    },
    findPropertyIdOf: (listingId) => Promise.resolve(propertyOfListing[listingId] ?? null),
    findByProperty: (propertyId) =>
      Promise.resolve([...listings.values()].filter((listing) => propertyOfListing[listing.listingId] === propertyId)),
    listPropertyIds: () => Promise.resolve([...new Set(Object.values(propertyOfListing))]),
  };
  const searchViews: IPropertySearchViewRepository = {
    save: (view) => {
      views.set(view.propertyId, view);
      return Promise.resolve();
    },
  };
  const transactions: ITransactionManager = { run: (fn) => fn() };

  return {
    processedEvents,
    projectedListings,
    searchViews,
    transactions,
    refresher: new PropertySearchViewRefresherService(projectedListings, searchViews),
    views,
  };
}
