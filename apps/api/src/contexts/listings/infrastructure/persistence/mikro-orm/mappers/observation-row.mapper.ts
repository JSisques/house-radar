import { DateValueObject } from '@house-radar/building-blocks';
import { type DataOrigin, known, ListingId, type Maybe, Money, UNKNOWN } from '@house-radar/shared-kernel';

import { ObservationAggregate } from '@contexts/listings/domain/aggregates/observation/observation.aggregate';
import { ListingStatus } from '@contexts/listings/domain/value-objects/listing-status/listing-status.value-object';
import { ObservationId } from '@contexts/listings/domain/value-objects/observation-id/observation-id.value-object';
import { RunId } from '@contexts/listings/domain/value-objects/run-id/run-id.value-object';
import type { ObservationRow } from '@contexts/listings/infrastructure/persistence/mikro-orm/schemas/observation.schema';

/** Maps the observation aggregate to its table row and back. */
export class ObservationRowMapper {
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
    const aggregate = new ObservationAggregate({
      id: new ObservationId(row.id),
      listingId: new ListingId(row.listingId),
      runId: row.runId === null ? undefined : new RunId(row.runId),
      observedAt: new DateValueObject(row.observedAt),
      price,
      status: new ListingStatus(row.status),
      snapshot: row.snapshot ?? undefined,
    });
    aggregate.markPersisted(row.version);
    return aggregate;
  }
}
