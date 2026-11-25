export const TELEMETRY_TOKEN = Symbol('TELEMETRY_TOKEN');

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/** Tracing seam. Application code depends on this port, never on a telemetry vendor SDK. */
export interface ITelemetry {
  /** Runs `fn` inside a new span; the span is current for everything `fn` awaits. */
  runInSpan<T>(name: string, fn: () => Promise<T>): Promise<T>;
  /** Trace identifier of the current span, or `undefined` outside any span. */
  currentTraceId(): string | undefined;
  /** Exports a log record (correlated with the current span) to the telemetry backend. */
  emitLog(level: LogLevel, message: string, attributes: Record<string, unknown>): void;
}
