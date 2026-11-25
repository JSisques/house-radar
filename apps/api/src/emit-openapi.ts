import 'reflect-metadata';

import { writeFile } from 'node:fs/promises';

import { NestFactory } from '@nestjs/core';

import { buildOpenApiDocument } from '@core/openapi/openapi/openapi.js';

import { AppModule } from './app.module.js';
import { configureApp } from './bootstrap.js';

/** Writes the OpenAPI document to `openapi.json` (or the path in argv[2]) without listening on a port. */
async function emit(): Promise<void> {
  const target = process.argv[2] ?? 'openapi.json';
  const app = await NestFactory.create(AppModule, { logger: false });
  configureApp(app);
  await app.init();
  await writeFile(target, `${JSON.stringify(buildOpenApiDocument(app), null, 2)}\n`);
  await app.close();
}

void emit();
