// Path: src/contexts/<context>/domain/aggregates/<name>/<name>.aggregate.ts
// Framework-free: no NestJS, MikroORM or @nestjs/cqrs imports.
// AggregateRoot (building-blocks) takes only the identity and provides record(), peekDomainEvents(),
// clearDomainEvents(), `version` (optimistic locking, D23), isNew() and markPersisted(version).
// It has no createdAt/updatedAt: model dates the aggregate really needs as its own value objects.
// Constructor only hydrates. State changes happen in named methods that mutate and record() an event.
import { AggregateRoot, generateEventMetadata } from '@house-radar/building-blocks';
import type { ListingId, ListingUrl, Money } from '@house-radar/shared-kernel';

import { ListingImportedEvent } from '@contexts/listings/domain/events/listing-imported/listing-imported.event';
import { ListingPriceChangedEvent } from '@contexts/listings/domain/events/listing-price-changed/listing-price-changed.event';
import type { IListingPrimitives } from '@contexts/listings/domain/primitives/listing.primitives';
import type { ListingTitle } from '@contexts/listings/domain/value-objects/listing-title/listing-title.value-object';

export interface IListingProps {
  id: ListingId;
  sourceUrl: ListingUrl;
  title: ListingTitle;
  price: Money;
}

export class ListingAggregate extends AggregateRoot<ListingId> {
  readonly sourceUrl: ListingUrl;
  private _title: ListingTitle;
  private _price: Money;

  constructor(props: IListingProps) {
    super(props.id);
    this.sourceUrl = props.sourceUrl;
    this._title = props.title;
    this._price = props.price;
  }

  get title(): ListingTitle {
    return this._title;
  }

  get price(): Money {
    return this._price;
  }

  create(): void {
    this.record(new ListingImportedEvent(generateEventMetadata(), this.toPrimitives()));
  }

  changePrice(newPrice: Money): void {
    const previousPrice = this._price;
    this._price = newPrice;
    this.record(
      new ListingPriceChangedEvent(generateEventMetadata(), {
        id: this.id.value,
        previousPriceCents: previousPrice.cents,
        newPriceCents: newPrice.cents,
      }),
    );
  }

  toPrimitives(): IListingPrimitives {
    return {
      id: this.id.value,
      sourceUrl: this.sourceUrl.value,
      title: this._title.value,
      priceCents: this._price.cents,
    };
  }
}
