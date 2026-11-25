import { type INestApplication, ValidationPipe } from '@nestjs/common';

import { setupOpenApi } from '@core/openapi/openapi-document/openapi-document.js';

export const GLOBAL_PREFIX = 'api';

/** App-level wiring shared by `main.ts`, the OpenAPI emitter and the e2e specs. */
export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix(GLOBAL_PREFIX);
  // `whitelist` drops unknown properties; presence of required fields is asserted by the application.
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  setupOpenApi(app);
}
