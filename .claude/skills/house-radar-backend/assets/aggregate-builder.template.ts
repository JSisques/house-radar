// Path: src/contexts/<context>/domain/builders/<name>/<name>.builder.ts
// Aggregate builders build aggregates only (view models are built by mappers/projections).
import { BaseBuilder, DateValueObject, FieldIsRequiredException } from '@house-radar/building-blocks';
import { ListingId, Money } from '@house-radar/shared-kernel';

import { ListingAggregate } from '@contexts/listings/domain/aggregates/listing/listing.aggregate';
import { ListingTitle } from '@contexts/listings/domain/value-objects/listing-title/listing-title.value-object';

export class ListingBuilder extends BaseBuilder<ListingAggregate> {
  private id?: ListingId;
  private createdAt?: DateValueObject;
  private updatedAt?: DateValueObject;
  private title?: ListingTitle;
  private price?: Money;

  withId(id: ListingId): this {
    this.id = id;
    return this;
  }

  withCreatedAt(createdAt: DateValueObject): this {
    this.createdAt = createdAt;
    return this;
  }

  withUpdatedAt(updatedAt: DateValueObject): this {
    this.updatedAt = updatedAt;
    return this;
  }

  withTitle(title: ListingTitle): this {
    this.title = title;
    return this;
  }

  withPrice(price: Money): this {
    this.price = price;
    return this;
  }

  protected validate(): void {
    if (!this.id) throw new FieldIsRequiredException('id');
    if (!this.createdAt) throw new FieldIsRequiredException('createdAt');
    if (!this.updatedAt) throw new FieldIsRequiredException('updatedAt');
    if (!this.title) throw new FieldIsRequiredException('title');
    if (!this.price) throw new FieldIsRequiredException('price');
  }

  build(): ListingAggregate {
    this.validate();
    return new ListingAggregate({
      id: this.id!,
      createdAt: this.createdAt!,
      updatedAt: this.updatedAt!,
      title: this.title!,
      price: this.price!,
    });
  }
}
