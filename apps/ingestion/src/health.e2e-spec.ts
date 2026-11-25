import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { type StartedRedis, startRedis } from '@house-radar/testing';

import { AppModule } from './app.module.js';

/** Nothing listens on port 1: connections are refused immediately. */
const UNREACHABLE_REDIS = 'redis://127.0.0.1:1';

describe('GET /health', () => {
  const originalEnv = { ...process.env };
  let redis: StartedRedis;
  let app: INestApplication | undefined;

  async function boot(redisUrl: string): Promise<INestApplication> {
    process.env.REDIS_URL = redisUrl;
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    return app;
  }

  beforeAll(async () => {
    redis = await startRedis();
  });
  afterEach(async () => {
    process.env = { ...originalEnv };
    await app?.close();
    app = undefined;
  });
  afterAll(async () => {
    await redis.stop();
  });

  it('should report healthy when Redis is reachable', async () => {
    const server = (await boot(redis.url)).getHttpServer();

    const res = await request(server).get('/health').expect(200);

    expect(res.body.status).toBe('ok');
    expect(res.body.info).toMatchObject({ redis: { status: 'up' } });
  });

  it('should report unhealthy when Redis is unreachable', async () => {
    const server = (await boot(UNREACHABLE_REDIS)).getHttpServer();

    const res = await request(server).get('/health').expect(503);

    expect(res.body.status).toBe('error');
    expect(res.body.error).toMatchObject({ redis: { status: 'down' } });
  });
});
