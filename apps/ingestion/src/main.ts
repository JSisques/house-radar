import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';

import { AppConfig } from '@core/config/app-config/app-config.js';

import { AppModule } from './app.module.js';

async function main(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  // Let SIGTERM close queues and workers so an active job finishes before the replica stops.
  app.enableShutdownHooks();
  await app.listen(app.get(AppConfig).port);
}

void main();
