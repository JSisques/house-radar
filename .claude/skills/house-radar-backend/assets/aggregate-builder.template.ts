// Path: src/contexts/<context>/domain/builders/<name>/<name>.builder.ts
// Aggregate builders build aggregates only (view models are built by mappers/projections).
// Builder (building-blocks) validates the fields returned by requiredFields(): the first one that is
// null or undefined throws FieldIsRequiredException. Optional fields get a default in build().
import { Builder } from '@house-radar/building-blocks';
import { ListingId, type ListingUrl, type Money } from '@house-radar/shared-kernel';

import { ListingAggregate } from '@contexts/listings/domain/aggregates/listing/listing.aggregate';
import type { ListingTitle } from '@contexts/listings/domain/value-objects/listing-title/listing-title.value-object';

export class ListingBuilder extends Builder<ListingAggregate> {
  private idValue?: ListingId;
  private sourceUrlValue?: ListingUrl;
  private titleValue?: ListingTitle;
  private priceValue?: Money;

  withId(id: ListingId): this {
    this.idValue = id;
    return this;
  }

  withSourceUrl(sourceUrl: ListingUrl): this {
    this.sourceUrlValue = sourceUrl;
    return this;
  }

  withTitle(title: ListingTitle): this {
    this.titleValue = title;
    return this;
  }

  withPrice(price: Money): this {
    this.priceValue = price;
    return this;
  }

  protected requiredFields(): Readonly<Record<string, unknown>> {
    return { sourceUrl: this.sourceUrlValue, title: this.titleValue, price: this.priceValue };
  }

  build(): ListingAggregate {
    this.validate();
    return new ListingAggregate({
      id: this.idValue ?? ListingId.generate(),
      sourceUrl: this.sourceUrlValue as ListingUrl,
      title: this.titleValue as ListingTitle,
      price: this.priceValue as Money,
    });
  }
}
