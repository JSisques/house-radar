---
title: "D28. Mapa de bounded contexts"
description: "El backend tiene seis bounded contexts (ingestion, listings, properties, geography, identity, users) con relaciones explícitas; pricing-history no es un contexto."
sidebar:
  order: 29
---

- **Estado:** Aceptada
- **Fecha:** 2026-11-20

## Contexto

[D4](/es/adr/d04-backend-framework/) organiza el backend por bounded contexts y enumeró candidatos (`listings`, `properties`, `pricing-history`, `ingestion`, `users`), y [D13](/es/adr/d13-users-and-authentication/) añadió `identity`. Antes de diseñar agregados y base de datos necesitamos el mapa final: qué contextos existen, qué posee cada uno y cómo se comunican ([D10](/es/adr/d10-cross-cutting-architecture/), [D25](/es/adr/d25-cqrs-and-context-structure/)).

## Decisión

Seis bounded contexts:

| Contexto | Responsabilidad | Agregados principales |
| --- | --- | --- |
| `ingestion` | Fuentes, ejecuciones, conectores ([D23](/es/adr/d23-ingestion-concurrency-model/)) | `Source`, `IngestionRun` |
| `listings` | Anuncios y lo observado sobre cada uno | `Listing`, `Observation` |
| `properties` | Propiedades reales, consolidación y duplicados | `Property`, `DuplicateCandidate` |
| `geography` | Municipios y provincias (límites del IGN, [D18](/es/adr/d18-location-pin-declared-precision/)) | Datos de referencia de solo lectura |
| `identity` | Cuenta, credenciales, sesión, bloqueo ([D13](/es/adr/d13-users-and-authentication/)) | `Account` |
| `users` | Perfil, preferencias, favoritos, búsquedas guardadas | `UserProfile`, `Favorite`, `SavedSearch` |

Relaciones:

| Origen | Destino | Mecanismo |
| --- | --- | --- |
| `ingestion` | `listings` | Puerto `RecordObservation` (comando síncrono, upsert idempotente, [D23](/es/adr/d23-ingestion-concurrency-model/)) |
| `listings` | `properties` | Eventos `ListingObserved`, `ListingPriceChanged`, `ListingDisappeared` |
| `properties` | `geography` | Puerto `ResolveMunicipality` |
| `users` | `properties` | Puerto `AssertPropertyExists` |
| `identity` | `users` | Evento `AccountCreated` |

Dos cambios respecto a la lista de candidatos de D4:

- `pricing-history` no es un contexto. El histórico de precios son las observaciones del anuncio ([D20](/es/adr/d20-listing-consolidation-rules/)) y vive en `listings`; la evolución del precio activo más bajo de una propiedad es una proyección dentro de `properties`.
- Se añade `geography`: la resolución de municipio por punto en polígono tiene sus propios datos de referencia y su propio ciclo de vida.

El dashboard (HR-F009) no es un contexto: son consultas sobre modelos de lectura de `properties`.

Los detalles están en [Mapa de contextos](/es/architecture/context-map/).

## Consecuencias

- Cada contexto posee sus datos y su lenguaje; los únicos puntos de acoplamiento son los puertos y eventos indicados.
- `listings` no conoce `properties`: emite eventos y `properties` reacciona, de modo que las reglas de consolidación pueden cambiar sin tocar la ingesta.
- El histórico de precios no necesita un contexto extra ni sincronización: es una lectura de observaciones más una proyección.
- `geography` es un contexto pequeño de solo lectura: añade un módulo, pero aísla los datos de referencia de PostGIS y la importación del IGN.
- Toda nueva interacción entre contextos debe añadirse al mapa como puerto o evento.

## Alternativas consideradas

- **Mantener `pricing-history` como contexto:** duplicaría las observaciones que ya posee `listings` y obligaría a sincronizar dos almacenes para un mismo hecho. Descartada.
- **Sin contexto `geography` (límites dentro de `properties`):** mezcla datos de referencia de solo lectura con un modelo de consolidación que cambia a menudo y hace que la importación del IGN forme parte de las migraciones de `properties`. Descartada.
