import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, type OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

export function buildOpenApiDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder().setTitle('House Radar API').setVersion('0.0.0').build();
  return SwaggerModule.createDocument(app, config);
}

/** Serves the document as JSON at `<global prefix>/openapi.json`. */
export function setupOpenApi(app: INestApplication): void {
  SwaggerModule.setup('', app, buildOpenApiDocument(app), {
    ui: false,
    jsonDocumentUrl: 'openapi.json',
    useGlobalPrefix: true,
  });
}
