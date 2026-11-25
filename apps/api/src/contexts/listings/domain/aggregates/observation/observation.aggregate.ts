import { AggregateRoot, type DateValueObject, generateEventMetadata } from '@house-radar/building-blocks';
import { type ListingId, type Maybe, maybeToPrimitives, type Money } from '@house-radar/shared-kernel';

import { ListingObservedEvent } from '@contexts/listings/domain/events/listing-observed/listing-observed.event';
import type { IObservationProps } from '@contexts/listings/domain/interfaces/observation-props.interface';
import type { IObservationPrimitives } from '@contexts/listings/domain/primitives/observation.primitives';
import type { ListingStatus } from '@contexts/listings/domain/value-objects/listing-status/listing-status.value-object';
import type { ObservationId } from '@contexts/listings/domain/value-objects/observation-id/observation-id.value-object';
import type { RunId } from '@contexts/listings/domain/value-objects/run-id/run-id.value-object';

/**
 * What was seen about a listing at a point in time. Immutable and append-only: it has no state
 * transition and no mutator, so a later observation never touches an earlier one (D29).
 * Uniqueness per (listing, run) is enforced on save; `conflictsWith` is the rule itself (D23).
 */
export class ObservationAggregate extends AggregateRoot<ObservationId> {
  readonly listingId: ListingId;
  readonly runId: RunId | undefined;
  readonly observedAt: DateValueObject;
  readonly price: Maybe<Money>;
  readonly status: ListingStatus;
  readonly snapshot: Readonly<Record<string, unknown>> | undefined;

  constructor(props: IObservationProps) {
    super(props.id);
    this.listingId = props.listingId;
    this.runId = props.runId;
    this.observedAt = props.observedAt;
    this.price = props.price;
    this.status = props.status;
    this.snapshot = props.snapshot === undefined ? undefined : Object.freeze(structuredClone(props.snapshot));
  }

  /** True when both are for the same listing and the same run. A manual check has no run and never conflicts. */
  conflictsWith(other: ObservationAggregate): boolean {
    if (this.runId === undefined || other.runId === undefined) return false;
    return this.listingId.equals(other.listingId) && this.runId.equals(other.runId);
  }

  /** Records that the listing was observed. */
  create(): void {
    this.record(new ListingObservedEvent(generateEventMetadata(), this.toPrimitives()));
  }

  toPrimitives(): IObservationPrimitives {
    return {
      id: this.id.value,
      listingId: this.listingId.value,
      runId: this.runId?.value ?? null,
      observedAt: this.observedAt.value,
      price: maybeToPrimitives(this.price, (v) => v.cents),
      status: this.status.value,
      snapshot: this.snapshot ?? null,
    };
  }
}
