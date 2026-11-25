export const LOGGER_TOKEN = Symbol('LOGGER_TOKEN');

export type LogFields = Record<string, unknown>;

/** Structured logging. Fields are merged into the log line; secrets are redacted by the adapter. */
export interface ILogger {
  debug(message: string, fields?: LogFields): void;
  info(message: string, fields?: LogFields): void;
  warn(message: string, fields?: LogFields): void;
  error(message: string, fields?: LogFields): void;
}
