import { Inject, Injectable } from '@nestjs/common';

import { DateValueObject } from '@house-radar/building-blocks';
import { type DataOrigin, known, ListingId, type Maybe, Money, UNKNOWN } from '@house-radar/shared-kernel';

import type { ObservationAggregate } from '@contexts/listings/domain/aggregates/observation/observation.aggregate';
import {
  type IObservationBuilderFactory,
  OBSERVATION_BUILDER_FACTORY_TOKEN,
} from '@contexts/listings/domain/builders/observation/observation-builder.factory';
import { ListingStatus } from '@contexts/listings/domain/value-objects/listing-status/listing-status.value-object';
import { ObservationId } from '@contexts/listings/domain/value-objects/observation-id/observation-id.value-object';
import { RunId } from '@contexts/listings/domain/value-objects/run-id/run-id.value-object';
import type { ObservationRow } from '@contexts/listings/infrastructure/persistence/mikro-orm/schemas/observation.schema';

/** Maps the observation aggregate to its table row and back. */
@Injectable()
export class ObservationRowMapper {
  constructor(@Inject(OBSERVATION_BUILDER_FACTORY_TOKEN) private readonly builders: IObservationBuilderFactory) {}

  toRow(aggregate: ObservationAggregate): Omit<ObservationRow, 'version'> {
    const p = aggregate.toPrimitives();
    return {
      id: p.id,
      listingId: p.listingId,
      runId: p.runId,
      priceCents: p.price.kind === 'known' ? BigInt(p.price.value) : null,
      priceOrigin: p.price.kind === 'known' ? p.price.origin : null,
      status: p.status,
      observedAt: p.observedAt,
      snapshot: p.snapshot,
    };
  }

  toAggregate(row: ObservationRow): ObservationAggregate {
    const price: Maybe<Money> =
      row.priceCents === null
        ? UNKNOWN
        : known(new Money(Number(row.priceCents)), (row.priceOrigin ?? 'declared') as DataOrigin);
    const builder = this.builders
      .create()
      .withId(new ObservationId(row.id))
      .withListingId(new ListingId(row.listingId))
      .withObservedAt(new DateValueObject(row.observedAt))
      .withPrice(price)
      .withStatus(new ListingStatus(row.status));
    if (row.runId !== null) builder.withRunId(new RunId(row.runId));
    if (row.snapshot !== null) builder.withSnapshot(row.snapshot);
    const aggregate = builder.build();
    aggregate.markPersisted(row.version);
    return aggregate;
  }
}
