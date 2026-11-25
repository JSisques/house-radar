import { Global, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

import { AppConfig } from '@core/config/app-config/app-config.js';
import { validateEnv } from '@core/config/env/env.schema.js';
import { AllExceptionsFilter } from '@core/exceptions/all-exceptions/all-exceptions.filter.js';
import { ExceptionMappingRegistry } from '@core/exceptions/exception-mapping/exception-mapping.registry.js';

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
