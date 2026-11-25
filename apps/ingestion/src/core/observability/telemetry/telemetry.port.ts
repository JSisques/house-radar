export const TELEMETRY_TOKEN = Symbol('TELEMETRY_TOKEN');

/** Tracing seam. Application code depends on this port, never on a telemetry vendor SDK. */
export interface ITelemetry {
  /** Runs `fn` inside a new span; the span is current for everything `fn` awaits. */
  runInSpan<T>(name: string, fn: () => Promise<T>): Promise<T>;
  /** Trace identifier of the current span, or `undefined` outside any span. */
  currentTraceId(): string | undefined;
}
