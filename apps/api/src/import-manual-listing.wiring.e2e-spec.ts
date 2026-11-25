import type { INestApplication } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { type StartedPostgres, startPostgres } from '@house-radar/testing';

import { AppModule } from './app.module.js';
import { ImportManualListingCommand } from './contexts/ingestion/application/commands/import-manual-listing/import-manual-listing.command.js';
import { runMigrations } from './core/persistence/migrations/run-migrations.js';

describe('ImportManualListingCommand wiring', () => {
  const originalEnv = { ...process.env };
  let postgres: StartedPostgres;
  let app: INestApplication;

  beforeAll(async () => {
    postgres = await startPostgres();
    await runMigrations(postgres.connectionUri);
    process.env.DATABASE_URL = postgres.connectionUri;
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });
  afterAll(async () => {
    process.env = { ...originalEnv };
    await app?.close();
    await postgres?.stop();
  });

  it('should import a manual listing through the command bus and reject its duplicate', async () => {
    const bus = app.get(CommandBus);
    const command = () => new ImportManualListingCommand({ url: 'https://example.com/flat/1', priceCents: 25_000_000 });

    const created = await bus.execute(command());

    expect(created).toEqual({ id: expect.any(String) });
    await expect(bus.execute(command())).rejects.toMatchObject({ code: 'DUPLICATE_MANUAL_LISTING' });
  });
});
