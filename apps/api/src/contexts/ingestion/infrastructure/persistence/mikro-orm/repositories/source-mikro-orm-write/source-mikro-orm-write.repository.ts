import { EntityManager } from '@mikro-orm/postgresql';
import { Inject, Injectable } from '@nestjs/common';

import type { SourceId } from '@house-radar/shared-kernel';

import type { SourceAggregate } from '@contexts/ingestion/domain/aggregates/source/source.aggregate';
import type { ISourceWriteRepository } from '@contexts/ingestion/domain/repositories/write/source-write.repository';
import { SourceRowMapper } from '@contexts/ingestion/infrastructure/persistence/mikro-orm/mappers/source-row/source-row.mapper';
import {
  SOURCE_ENTITY,
  type SourceRow,
} from '@contexts/ingestion/infrastructure/persistence/mikro-orm/schemas/source.schema';

/** Stores sources. A source raises no events, so it needs no outbox: it is a plain upsert by its stable key. */
@Injectable()
export class SourceMikroOrmWriteRepository implements ISourceWriteRepository {
  constructor(
    @Inject(EntityManager) private readonly em: EntityManager,
    @Inject(SourceRowMapper) private readonly mapper: SourceRowMapper,
  ) {}

  async save(aggregate: SourceAggregate): Promise<void> {
    const state = this.mapper.toRow(aggregate);
    await this.em.transactional(async (em) => {
      const existing = await em.findOne<SourceRow>(SOURCE_ENTITY, { id: state.id });
      if (existing === null) em.persist(em.create(SOURCE_ENTITY, state as never));
      else em.assign(existing, state as never);
    });
  }

  async findById(id: SourceId): Promise<SourceAggregate | null> {
    const row = await this.em.fork().findOne<SourceRow>(SOURCE_ENTITY, { id: id.value });
    return row === null ? null : this.mapper.toAggregate(row);
  }

  async delete(id: SourceId): Promise<void> {
    await this.em.nativeDelete(SOURCE_ENTITY, { id: id.value });
  }
}
