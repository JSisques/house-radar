import { Builder, type DateValueObject } from '@house-radar/building-blocks';
import { type ListingId, type Maybe, type Money, UNKNOWN } from '@house-radar/shared-kernel';

import { ObservationAggregate } from '@contexts/listings/domain/aggregates/observation/observation.aggregate';
import { ListingStatus } from '@contexts/listings/domain/value-objects/listing-status/listing-status.value-object';
import { ObservationId } from '@contexts/listings/domain/value-objects/observation-id/observation-id.value-object';
import type { RunId } from '@contexts/listings/domain/value-objects/run-id/run-id.value-object';

/** Builds an observation. Without an id it gets a fresh UUIDv7; price defaults to unknown and status to active. */
export class ObservationBuilder extends Builder<ObservationAggregate> {
  private listingIdValue?: ListingId;
  private observedAtValue?: DateValueObject;
  private runIdValue?: RunId;
  private priceValue?: Maybe<Money>;
  private statusValue?: ListingStatus;
  private snapshotValue?: Readonly<Record<string, unknown>>;
  private idValue?: ObservationId;

  withListingId(listingId: ListingId): this {
    this.listingIdValue = listingId;
    return this;
  }

  withObservedAt(observedAt: DateValueObject): this {
    this.observedAtValue = observedAt;
    return this;
  }

  withRunId(runId: RunId): this {
    this.runIdValue = runId;
    return this;
  }

  withPrice(price: Maybe<Money>): this {
    this.priceValue = price;
    return this;
  }

  withStatus(status: ListingStatus): this {
    this.statusValue = status;
    return this;
  }

  withSnapshot(snapshot: Readonly<Record<string, unknown>>): this {
    this.snapshotValue = snapshot;
    return this;
  }

  withId(id: ObservationId): this {
    this.idValue = id;
    return this;
  }

  protected requiredFields(): Readonly<Record<string, unknown>> {
    return { listingId: this.listingIdValue, observedAt: this.observedAtValue };
  }

  build(): ObservationAggregate {
    this.validate();
    return new ObservationAggregate({
      id: this.idValue ?? ObservationId.generate(),
      listingId: this.listingIdValue as ListingId,
      runId: this.runIdValue,
      observedAt: this.observedAtValue as DateValueObject,
      price: this.priceValue ?? UNKNOWN,
      status: this.statusValue ?? ListingStatus.active(),
      snapshot: this.snapshotValue,
    });
  }
}
