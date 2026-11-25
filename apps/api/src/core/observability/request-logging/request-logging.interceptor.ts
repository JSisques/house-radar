import {
  type CallHandler,
  type ExecutionContext,
  HttpException,
  Inject,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { from, lastValueFrom, type Observable } from 'rxjs';

import { type ILogger, LOGGER_TOKEN } from '@core/observability/logger/logger.port.js';
import { type ITelemetry, TELEMETRY_TOKEN } from '@core/observability/telemetry/telemetry.port.js';

/** Wraps each HTTP request in a span and writes one structured log line when it ends. */
@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  constructor(
    @Inject(LOGGER_TOKEN) private readonly logger: ILogger,
    @Inject(TELEMETRY_TOKEN) private readonly telemetry: ITelemetry,
  ) {}

  intercept(executionContext: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (executionContext.getType() !== 'http') {
      return next.handle();
    }
    const http = executionContext.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const route = { method: request.method, url: request.originalUrl };
    const startedAt = Date.now();

    return from(
      this.telemetry.runInSpan(`${route.method} ${route.url}`, async () => {
        try {
          const result = await lastValueFrom(next.handle(), { defaultValue: undefined });
          this.logger.info('request completed', {
            ...route,
            statusCode: response.statusCode,
            durationMs: Date.now() - startedAt,
          });
          return result;
        } catch (error) {
          const statusCode = error instanceof HttpException ? error.getStatus() : 500;
          const log = statusCode >= 500 ? this.logger.error : this.logger.warn;
          log.call(this.logger, 'request failed', { ...route, statusCode, durationMs: Date.now() - startedAt });
          throw error;
        }
      }),
    );
  }
}
