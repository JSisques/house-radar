import type { EntityManager } from '@mikro-orm/core';

import type { ObservationAggregate } from '@contexts/listings/domain/aggregates/observation/observation.aggregate';
import type { IObservationWriteRepository } from '@contexts/listings/domain/repositories/write/observation-write.repository';
import type { ObservationId } from '@contexts/listings/domain/value-objects/observation-id/observation-id.value-object';
import { ObservationRowMapper } from '@contexts/listings/infrastructure/persistence/mikro-orm/mappers/observation-row.mapper';
import {
  OBSERVATION_ENTITY,
  type ObservationRow,
} from '@contexts/listings/infrastructure/persistence/mikro-orm/schemas/observation.schema';
import { OutboxWriteRepository } from '@core/persistence/outbox/outbox-write.repository.js';

/**
 * Stores observations, which are append-only. At most one observation exists per (listing, run): the database
 * rejects a second one, and the whole save, outbox event included, is rolled back (D23).
 */
export class ObservationMikroOrmWriteRepository
  extends OutboxWriteRepository<ObservationId, ObservationAggregate, ObservationRow>
  implements IObservationWriteRepository
{
  private readonly mapper = new ObservationRowMapper();

  constructor(em: EntityManager) {
    super(em, { entity: OBSERVATION_ENTITY, outboxSchema: 'listings', aggregateType: 'Observation' });
  }

  protected toRow(aggregate: ObservationAggregate): Omit<ObservationRow, 'version'> {
    return this.mapper.toRow(aggregate);
  }

  protected toAggregate(row: ObservationRow): ObservationAggregate {
    return this.mapper.toAggregate(row);
  }
}
