import { Injectable } from '@nestjs/common';

import type { ExceptionMapping } from './exception-mapping.js';

/**
 * Collects exception mappings registered by each context (typically in `onModuleInit`),
 * so adding a context never edits `core`.
 */
@Injectable()
export class ExceptionMappingRegistry {
  private readonly mappings: ExceptionMapping[] = [];

  register(mappings: ExceptionMapping[]): void {
    this.mappings.push(...mappings);
  }

  /** Returns the mapping of the most specific registered class the error is an instance of. */
  find(error: Error): ExceptionMapping | undefined {
    let best: ExceptionMapping | undefined;
    for (const mapping of this.mappings) {
      if (!(error instanceof mapping.exception)) continue;
      if (!best || mapping.exception.prototype instanceof best.exception) best = mapping;
    }
    return best;
  }
}
