// Path: src/contexts/<context>/domain/aggregates/<name>/<name>.aggregate.ts
// Framework-free: no NestJS, MikroORM or @nestjs/cqrs imports.
import { Aggregate } from '@house-radar/building-blocks';
import { ListingId, Money } from '@house-radar/shared-kernel';

import { ListingImportedEvent } from '@contexts/listings/domain/events/listing-imported/listing-imported.event';
import { ListingTitle } from '@contexts/listings/domain/value-objects/listing-title/listing-title.value-object';

export class ListingAggregate extends Aggregate<ListingId> {
  constructor(
    id: ListingId,
    private _title: ListingTitle,
    private _price: Money,
  ) {
    super(id);
  }

  get title(): ListingTitle {
    return this._title;
  }

  get price(): Money {
    return this._price;
  }

  // Named method: changes state and records the event. Never publishes it.
  create(): void {
    this.record(new ListingImportedEvent(this.id.value, this._price.toPrimitives()));
  }

  toPrimitives() {
    return { id: this.id.value, title: this._title.value, price: this._price.toPrimitives() };
  }
}
