import type { DestinationStream } from 'pino';
import type { Level } from 'pino';
import { pino } from 'pino';

import type { ILogger, LogFields } from '@core/observability/logger/logger.port.js';
import type { ITelemetry, LogLevel } from '@core/observability/telemetry/telemetry.port.js';

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

const EXPORTED_LEVELS: readonly LogLevel[] = ['debug', 'info', 'warn', 'error'];

/** Pino stream that forwards every (already redacted) JSON line to telemetry, keeping redaction in one place. */
function telemetryStream(telemetry: ITelemetry): { write(line: string): void } {
  return {
    write(line: string): void {
      const { level, msg, ...attributes } = JSON.parse(line) as Record<string, unknown>;
      delete attributes.time;
      const name = pino.levels.labels[level as number] as Level;
      if ((EXPORTED_LEVELS as readonly string[]).includes(name)) {
        telemetry.emitLog(name as LogLevel, String(msg ?? ''), attributes);
      }
    },
  };
}

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
      pino.multistream([
        { level: 'trace', stream: options.destination ?? process.stdout },
        { level: 'trace', stream: telemetryStream(telemetry) },
      ]),
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
