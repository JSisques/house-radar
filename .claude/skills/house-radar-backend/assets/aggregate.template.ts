// Path: src/contexts/<context>/domain/aggregates/<name>/<name>.aggregate.ts
// Framework-free: no NestJS, MikroORM or @nestjs/cqrs imports.
// Constructor only hydrates. State changes happen in named methods: mutate, record(), touch().
import { AggregateRoot, DateValueObject } from '@house-radar/building-blocks';
import { ListingId, Money } from '@house-radar/shared-kernel';

import { IListingPrimitives } from '@contexts/listings/domain/primitives/listing.primitives';
import { ListingImportedEvent } from '@contexts/listings/domain/events/listing-imported/listing-imported.event';
import { ListingPriceChangedEvent } from '@contexts/listings/domain/events/listing-price-changed/listing-price-changed.event';
import { ListingTitle } from '@contexts/listings/domain/value-objects/listing-title/listing-title.value-object';

export class ListingAggregate extends AggregateRoot<ListingId> {
  private _title: ListingTitle;
  private _price: Money;

  constructor(props: {
    id: ListingId;
    createdAt: DateValueObject;
    updatedAt: DateValueObject;
    title: ListingTitle;
    price: Money;
  }) {
    super(props.id, props.createdAt, props.updatedAt);
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
    this.record(
      new ListingImportedEvent(this.generateEventMetadata(ListingImportedEvent), this.toPrimitives()),
    );
    this.touch();
  }

  changePrice(newPrice: Money): void {
    const previousPrice = this._price;
    this._price = newPrice;
    this.record(
      new ListingPriceChangedEvent(this.generateEventMetadata(ListingPriceChangedEvent), {
        id: this.id.value,
        previousPrice: previousPrice.toPrimitives(),
        newPrice: newPrice.toPrimitives(),
      }),
    );
    this.touch();
  }

  toPrimitives(): IListingPrimitives {
    return {
      id: this.id.value,
      createdAt: this.createdAt.value,
      updatedAt: this.updatedAt.value,
      title: this._title.value,
      price: this._price.toPrimitives(),
    };
  }
}
