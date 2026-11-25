import type { IWriteRepository } from '@house-radar/building-blocks';

import type { ObservationAggregate } from '@contexts/listings/domain/aggregates/observation/observation.aggregate';
import type { ObservationId } from '@contexts/listings/domain/value-objects/observation-id/observation-id.value-object';

export const OBSERVATION_WRITE_REPOSITORY = Symbol('OBSERVATION_WRITE_REPOSITORY');

/** Stores observations. A second observation of the same listing and run is rejected. */
export type IObservationWriteRepository = IWriteRepository<ObservationId, ObservationAggregate>;
