import type { INestApplication } from '@nestjs/common';

import { setupOpenApi } from '@core/openapi/openapi-document/openapi-document.js';

export const GLOBAL_PREFIX = 'api';

/** App-level wiring shared by `main.ts`, the OpenAPI emitter and the e2e specs. */
export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix(GLOBAL_PREFIX);
  setupOpenApi(app);
}
