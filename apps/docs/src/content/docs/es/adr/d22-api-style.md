---
title: "D22. Estilo de API"
description: "La web se comunica con la API mediante REST, descrita por un contrato OpenAPI a partir del cual se genera un cliente TypeScript tipado."
sidebar:
  order: 23
---

- **Estado:** Aceptada
- **Fecha:** 2026-11-20

## Contexto

`apps/web` ([D5](/es/adr/d05-frontend-framework/)) necesita comunicarse con `apps/api` ([D4](/es/adr/d04-backend-framework/)). Las interacciones principales son lecturas de recursos con muchos filtros (buscador, zona del mapa, estadísticas), las fichas de propiedades y anuncios, y un conjunto reducido de comandos (importación manual, comprobar anuncio, favoritos, búsquedas guardadas). Todo el stack es TypeScript ([D1](/es/adr/d01-language/)) y los tipos deben mantenerse sincronizados a ambos lados de la frontera.

## Decisión

La API es REST sobre HTTP, descrita mediante un contrato OpenAPI.

- `apps/api` genera el documento OpenAPI a partir de sus controladores y DTOs (`@nestjs/swagger`).
- `apps/web` genera un cliente TypeScript tipado a partir de ese documento (por ejemplo, con `openapi-typescript`).
- El cliente HTTP se accede mediante un puerto en el frontend ([D10](/es/adr/d10-cross-cutting-architecture/)).

## Consecuencias

- Los tipos son coherentes de extremo a extremo: un cambio en el contrato aparece como un error de tipos en `apps/web`.
- El buscador se modela como un recurso filtrado (por ejemplo, `GET /properties?minPrice=…&bbox=…`), lo que encaja con los filtros reflejados en la URL.
- El GeoJSON de PostGIS ([D6](/es/adr/d06-persistence/)) se devuelve tal cual al mapa ([D9](/es/adr/d09-map/)).
- Se aplican la caché y las herramientas HTTP estándar.
- El documento OpenAPI se publica en el portal de documentación ([D11](/es/adr/d11-documentation-portal/)).
- La CI debe verificar que el cliente generado está actualizado respecto al contrato ([D16](/es/adr/d16-quality-and-workflow/)).

## Alternativas consideradas

- **GraphQL:** su punto fuerte es servir a muchos clientes distintos con necesidades de datos diferentes; el MVP tiene un único cliente (la SPA). Se descarta porque añade la gestión de N+1 (DataLoader), complica la caché y convierte el GeoJSON en un scalar opaco. Como el cliente HTTP está detrás de un puerto, un adaptador GraphQL sigue siendo posible si una necesidad futura lo justifica.
- **tRPC / ts-rest:** tipos de extremo a extremo sin generación de código. Se descartan porque acoplan fuertemente el frontend al backend, encajan mal con los controladores de NestJS y no servirían para una futura aplicación móvil (V3).
