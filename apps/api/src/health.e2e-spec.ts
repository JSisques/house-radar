import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { type StartedPostgres, type StartedRedis, startPostgres, startRedis } from '@house-radar/testing';

import { AppModule } from './app.module.js';
import { configureApp } from './bootstrap.js';

/** Nothing listens on port 1: connections are refused immediately. */
const UNREACHABLE_POSTGRES = 'postgres://nobody:nobody@127.0.0.1:1/nothing';
const UNREACHABLE_REDIS = 'redis://127.0.0.1:1';

describe('GET /api/health', () => {
  const originalEnv = { ...process.env };
  let postgres: StartedPostgres;
  let redis: StartedRedis;
  let app: INestApplication | undefined;

  async function boot(env: { databaseUrl: string; redisUrl: string }): Promise<INestApplication> {
    process.env.DATABASE_URL = env.databaseUrl;
    process.env.REDIS_URL = env.redisUrl;
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
    return app;
  }

  beforeAll(async () => {
    [postgres, redis] = await Promise.all([startPostgres(), startRedis()]);
  });
  afterEach(async () => {
    process.env = { ...originalEnv };
    await app?.close();
    app = undefined;
  });
  afterAll(async () => {
    await Promise.all([postgres.stop(), redis.stop()]);
  });

  it('should report healthy when PostgreSQL and Redis are reachable', async () => {
    const server = (await boot({ databaseUrl: postgres.connectionUri, redisUrl: redis.url })).getHttpServer();

    const res = await request(server).get('/api/health').expect(200);

    expect(res.body.status).toBe('ok');
    expect(res.body.info).toMatchObject({ postgres: { status: 'up' }, redis: { status: 'up' } });
  });

  it('should report unhealthy when PostgreSQL is unreachable', async () => {
    const server = (await boot({ databaseUrl: UNREACHABLE_POSTGRES, redisUrl: redis.url })).getHttpServer();

    const res = await request(server).get('/api/health').expect(503);

    expect(res.body.status).toBe('error');
    expect(res.body.error).toMatchObject({ postgres: { status: 'down' } });
    expect(res.body.info).toMatchObject({ redis: { status: 'up' } });
  });

  it('should report unhealthy when Redis is unreachable', async () => {
    const server = (await boot({ databaseUrl: postgres.connectionUri, redisUrl: UNREACHABLE_REDIS })).getHttpServer();

    const res = await request(server).get('/api/health').expect(503);

    expect(res.body.status).toBe('error');
    expect(res.body.error).toMatchObject({ redis: { status: 'down' } });
    expect(res.body.info).toMatchObject({ postgres: { status: 'up' } });
  });

  it('should be public and documented in the OpenAPI document', async () => {
    const server = (await boot({ databaseUrl: postgres.connectionUri, redisUrl: redis.url })).getHttpServer();

    const res = await request(server).get('/api/openapi.json').expect(200);

    expect(res.body.paths['/api/health'].get).toBeDefined();
  });
});
