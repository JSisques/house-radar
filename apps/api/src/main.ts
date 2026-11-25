import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';

import { AppConfig } from '@core/config/app-config/app-config.js';

import { AppModule } from './app.module.js';
import { configureApp } from './bootstrap.js';

async function main(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  await app.listen(app.get(AppConfig).port);
}

void main();
