import type { OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { context, SpanStatusCode, trace } from '@opentelemetry/api';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { BatchSpanProcessor, NoopSpanProcessor } from '@opentelemetry/sdk-trace';

import type { ITelemetry } from '@core/observability/telemetry/telemetry.port.js';

export interface OtelTelemetryOptions {
  serviceName: string;
  /** OTLP/HTTP base URL of the collector. Without it spans stay in-process (ids still work) and nothing is exported. */
  otlpEndpoint?: string;
}

/** OpenTelemetry adapter: starts the SDK (traces + metrics) and exposes spans through `ITelemetry`. */
export class OtelTelemetry implements ITelemetry, OnModuleInit, OnApplicationShutdown {
  private readonly sdk: NodeSDK;
  private readonly tracerName: string;

  constructor(options: OtelTelemetryOptions) {
    this.tracerName = options.serviceName;
    const base = options.otlpEndpoint?.replace(/\/$/, '');
    this.sdk = new NodeSDK({
      serviceName: options.serviceName,
      spanProcessors: [
        base
          ? new BatchSpanProcessor({ exporter: new OTLPTraceExporter({ url: `${base}/v1/traces` }) })
          : new NoopSpanProcessor(),
      ],
      metricReaders: base
        ? [new PeriodicExportingMetricReader({ exporter: new OTLPMetricExporter({ url: `${base}/v1/metrics` }) })]
        : [],
    });
  }

  onModuleInit(): void {
    this.sdk.start();
  }

  async onApplicationShutdown(): Promise<void> {
    await this.sdk.shutdown();
  }

  runInSpan<T>(name: string, fn: () => Promise<T>): Promise<T> {
    return trace.getTracer(this.tracerName).startActiveSpan(name, async (span) => {
      try {
        return await fn();
      } catch (error) {
        span.setStatus({ code: SpanStatusCode.ERROR });
        throw error;
      } finally {
        span.end();
      }
    });
  }

  currentTraceId(): string | undefined {
    const spanContext = trace.getSpan(context.active())?.spanContext();
    return spanContext && trace.isSpanContextValid(spanContext) ? spanContext.traceId : undefined;
  }
}
