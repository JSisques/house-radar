import { Global, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

import { AppConfig } from './config/app-config.js';
import { validateEnv } from './config/env.schema.js';
import { AllExceptionsFilter } from './exceptions/all-exceptions.filter.js';
import { ExceptionMappingRegistry } from './exceptions/exception-mapping.registry.js';

@Global()
@Module({
  providers: [
    { provide: AppConfig, useFactory: () => new AppConfig(validateEnv(process.env)) },
    ExceptionMappingRegistry,
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
  exports: [AppConfig, ExceptionMappingRegistry],
})
export class CoreModule {}
