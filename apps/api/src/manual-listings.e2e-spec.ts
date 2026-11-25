import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { type StartedPostgres, startPostgres } from '@house-radar/testing';

import { AppModule } from './app.module.js';
import { configureApp } from './bootstrap.js';
import { runMigrations } from './core/persistence/migrations/run-migrations.js';

describe('POST /api/listings/manual', () => {
  const originalEnv = { ...process.env };
  let postgres: StartedPostgres;
  let app: INestApplication;

  beforeAll(async () => {
    postgres = await startPostgres();
    await runMigrations(postgres.connectionUri);
    process.env.DATABASE_URL = postgres.connectionUri;
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });
  afterAll(async () => {
    process.env = { ...originalEnv };
    await app?.close();
    await postgres?.stop();
  });

  it('should create the listing and answer 201 with its reference', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/listings/manual')
      .send({ url: 'https://example.com/flat/10', priceCents: 18_000_000, details: { title: 'Flat', bedrooms: 3 } })
      .expect(201);

    expect(res.body).toEqual({ id: expect.any(String) });
  });

  it('should answer 400 listing every missing required field', async () => {
    const res = await request(app.getHttpServer()).post('/api/listings/manual').send({}).expect(400);

    expect(res.body).toMatchObject({
      statusCode: 400,
      code: 'MISSING_MANUAL_LISTING_FIELDS',
      details: { missingFields: ['url', 'price'] },
    });
  });

  it('should answer 400 listing only the missing field', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/listings/manual')
      .send({ url: 'https://example.com/flat/11' })
      .expect(400);

    expect(res.body.details).toEqual({ missingFields: ['price'] });
  });

  it('should answer 400 on a malformed price', async () => {
    await request(app.getHttpServer())
      .post('/api/listings/manual')
      .send({ url: 'https://example.com/flat/12', priceCents: 'cheap' })
      .expect(400);
  });

  it('should answer 400 on an invalid URL', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/listings/manual')
      .send({ url: 'not a url', priceCents: 100 })
      .expect(400);

    expect(res.body.code).toBe('INVALID_LISTING_URL');
  });

  it('should answer 409 with the existing listing reference on a duplicate normalized URL', async () => {
    const server = app.getHttpServer();
    const first = await request(server)
      .post('/api/listings/manual')
      .send({ url: 'https://example.com/flat/20', priceCents: 100 })
      .expect(201);

    const res = await request(server)
      .post('/api/listings/manual')
      .send({ url: 'https://EXAMPLE.com/flat/20?utm_source=mail#photos', priceCents: 200 })
      .expect(409);

    expect(res.body).toMatchObject({
      statusCode: 409,
      code: 'DUPLICATE_MANUAL_LISTING',
      details: { listingId: first.body.id, action: 'check_listing' },
    });
  });

  it('should document the endpoint in the OpenAPI document', async () => {
    const res = await request(app.getHttpServer()).get('/api/openapi.json').expect(200);

    const responses = res.body.paths['/api/listings/manual'].post.responses;
    expect(Object.keys(responses)).toEqual(expect.arrayContaining(['201', '400', '409']));
  });
});
