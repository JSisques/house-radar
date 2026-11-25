import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { AppConfig } from '@core/config/app-config/app-config.js';
import { LOGGER_TOKEN } from '@core/observability/logger/logger.port.js';
import { PinoLogger } from '@core/observability/logger/pino-logger.adapter.js';
import { RequestLoggingInterceptor } from '@core/observability/request-logging/request-logging.interceptor.js';
import { OtelTelemetry } from '@core/observability/telemetry/otel-telemetry.adapter.js';
import { type ITelemetry, TELEMETRY_TOKEN } from '@core/observability/telemetry/telemetry.port.js';

const SERVICE_NAME = 'house-radar-api';

/** Binds the observability ports to their pino / OpenTelemetry adapters. Replace a provider to swap a vendor. */
@Global()
@Module({
  providers: [
    {
      provide: TELEMETRY_TOKEN,
      inject: [AppConfig],
      useFactory: (config: AppConfig) =>
        new OtelTelemetry({ serviceName: SERVICE_NAME, otlpEndpoint: config.otlpEndpoint }),
    },
    {
      provide: LOGGER_TOKEN,
      inject: [AppConfig, TELEMETRY_TOKEN],
      useFactory: (config: AppConfig, telemetry: ITelemetry) =>
        new PinoLogger({ level: config.logLevel, serviceName: SERVICE_NAME }, telemetry),
    },
    { provide: APP_INTERCEPTOR, useClass: RequestLoggingInterceptor },
  ],
  exports: [LOGGER_TOKEN, TELEMETRY_TOKEN],
})
export class ObservabilityModule {}
