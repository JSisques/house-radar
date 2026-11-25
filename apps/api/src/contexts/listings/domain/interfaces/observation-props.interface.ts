import type { DateValueObject } from '@house-radar/building-blocks';
import type { ListingId, Maybe, Money } from '@house-radar/shared-kernel';

import type { ListingStatus } from '@contexts/listings/domain/value-objects/listing-status/listing-status.value-object';
import type { ObservationId } from '@contexts/listings/domain/value-objects/observation-id/observation-id.value-object';
import type { RunId } from '@contexts/listings/domain/value-objects/run-id/run-id.value-object';

/** What the aggregate constructor needs to hydrate an observation. */
export interface IObservationProps {
  id: ObservationId;
  listingId: ListingId;
  /** Absent for a manual check. */
  runId?: RunId;
  observedAt: DateValueObject;
  price: Maybe<Money>;
  status: ListingStatus;
  /** The normalized listing as it was seen (HR-F008-BR3). */
  snapshot?: Readonly<Record<string, unknown>>;
}
