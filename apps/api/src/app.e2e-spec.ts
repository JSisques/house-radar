import { Controller, Get, type INestApplication, Module, type OnModuleInit } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';

import { DomainException } from '@house-radar/building-blocks';

import { AppModule } from './app.module.js';
import { configureApp } from './bootstrap.js';
import { ExceptionMappingRegistry } from './core/exceptions/exception-mapping.registry.js';

class WidgetNotFoundException extends DomainException {
  constructor() {
    super('WIDGET_NOT_FOUND', 'Widget not found');
  }
}

class UnmappedException extends DomainException {
  constructor() {
    super('UNMAPPED', 'boom');
  }
}

@Controller('widgets')
class WidgetsController {
  @Get('missing')
  missing(): never {
    throw new WidgetNotFoundException();
  }

  @Get('unmapped')
  unmapped(): never {
    throw new UnmappedException();
  }
}

@Module({ controllers: [WidgetsController] })
class WidgetsModule implements OnModuleInit {
  constructor(private readonly registry: ExceptionMappingRegistry) {}

  onModuleInit(): void {
    this.registry.register([{ exception: WidgetNotFoundException, status: 404, code: 'WIDGET_NOT_FOUND' }]);
  }
}

const originalEnv = { ...process.env };
let app: INestApplication | undefined;

async function boot(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule, WidgetsModule] }).compile();
  app = moduleRef.createNestApplication();
  configureApp(app);
  await app.init();
  return app;
}

afterEach(async () => {
  process.env = { ...originalEnv };
  await app?.close();
  app = undefined;
});

describe('api app', () => {
  it('serves a valid OpenAPI document at GET /api/openapi.json', async () => {
    const res = await request((await boot()).getHttpServer())
      .get('/api/openapi.json')
      .expect(200);

    expect(res.body.openapi).toMatch(/^3\./);
    expect(res.body.info.title).toBe('House Radar API');
    expect(res.body.paths).toBeTypeOf('object');
  });

  it('fails fast naming the variable when an env value is invalid', async () => {
    process.env.PORT = 'not-a-port';

    await expect(boot()).rejects.toThrow(/PORT/);
  });

  it('maps a registered context exception to its status and code', async () => {
    const res = await request((await boot()).getHttpServer())
      .get('/api/widgets/missing')
      .expect(404);

    expect(res.body).toEqual({ statusCode: 404, code: 'WIDGET_NOT_FOUND', message: 'Widget not found' });
  });

  it('answers 500 INTERNAL_ERROR without leaking details for unmapped exceptions', async () => {
    const res = await request((await boot()).getHttpServer())
      .get('/api/widgets/unmapped')
      .expect(500);

    expect(res.body).toEqual({ statusCode: 500, code: 'INTERNAL_ERROR', message: 'Internal server error' });
  });

  it('keeps the status of framework HTTP exceptions', async () => {
    const res = await request((await boot()).getHttpServer())
      .get('/api/nope')
      .expect(404);

    expect(res.body.statusCode).toBe(404);
    expect(res.body.code).toBe('HTTP_404');
  });
});
