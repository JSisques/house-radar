import { type ArgumentsHost, Catch, type ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import type { Response } from 'express';

import { ExceptionMappingRegistry } from '@core/exceptions/exception-mapping/exception-mapping.registry.js';

const INTERNAL_ERROR = { statusCode: 500, code: 'INTERNAL_ERROR', message: 'Internal server error' } as const;

/** Turns every thrown error into `{ statusCode, code, message }` using the registered mappings. */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly registry: ExceptionMappingRegistry) {}

  catch(error: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const body = this.toBody(error);
    response.status(body.statusCode).json(body);
  }

  private toBody(error: unknown): { statusCode: number; code: string; message: string } {
    const mapping = error instanceof Error ? this.registry.find(error) : undefined;
    if (mapping && error instanceof Error) {
      return { statusCode: mapping.status, code: mapping.code, message: error.message };
    }
    if (error instanceof HttpException) {
      const statusCode = error.getStatus();
      return { statusCode, code: `HTTP_${statusCode}`, message: error.message };
    }
    this.logger.error(error instanceof Error ? (error.stack ?? error.message) : String(error));
    return { ...INTERNAL_ERROR };
  }
}
