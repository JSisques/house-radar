import type { DestinationStream } from 'pino';
import { pino } from 'pino';

import type { ILogger, LogFields } from '@core/observability/logger/logger.port.js';
import type { ITelemetry } from '@core/observability/telemetry/telemetry.port.js';

export interface PinoLoggerOptions {
  level: string;
  serviceName: string;
  /** Defaults to stdout. */
  destination?: DestinationStream;
}

const SENSITIVE_FIELDS = ['password', 'token', 'authorization'];
const REDACT_PATHS = SENSITIVE_FIELDS.flatMap((field) => [
  field,
  `*.${field}`,
  `headers.${field}`,
  `*.headers.${field}`,
]);

/** JSON logger. Every line carries the current trace id; sensitive fields are redacted. */
export class PinoLogger implements ILogger {
  private readonly pino: pino.Logger;

  constructor(options: PinoLoggerOptions, telemetry: ITelemetry) {
    this.pino = pino(
      {
        level: options.level,
        base: { service: options.serviceName },
        redact: { paths: REDACT_PATHS, censor: '[REDACTED]' },
        mixin: () => {
          const traceId = telemetry.currentTraceId();
          return traceId ? { trace_id: traceId } : {};
        },
      },
      options.destination,
    );
  }

  debug(message: string, fields: LogFields = {}): void {
    this.pino.debug(fields, message);
  }

  info(message: string, fields: LogFields = {}): void {
    this.pino.info(fields, message);
  }

  warn(message: string, fields: LogFields = {}): void {
    this.pino.warn(fields, message);
  }

  error(message: string, fields: LogFields = {}): void {
    this.pino.error(fields, message);
  }
}
