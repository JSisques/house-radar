---
title: "D24. Bloques base propios"
description: "El backend y el frontend comparten dos paquetes sin framework, building-blocks y shared-kernel, en lugar de depender de un kit DDD externo."
sidebar:
  order: 25
---

- **Estado:** Aceptada
- **Fecha:** 2026-11-20

## Contexto

El DDD en `apps/api`, `apps/ingestion` ([D4](/es/adr/d04-backend-framework/)) y `apps/web` ([D5](/es/adr/d05-frontend-framework/)) necesita clases base compartidas: agregados, value objects, eventos de dominio, builders, criteria y puertos de repositorio. El autor ya tiene un kit (`@sisques-labs/nestjs-kit`) con estas piezas, pero su diseño entra en conflicto con decisiones de este proyecto:

- Su base de agregado extiende el `AggregateRoot` de `@nestjs/cqrs`, lo que mete un framework en el dominio y viola [D4](/es/adr/d04-backend-framework/) y [D10](/es/adr/d10-cross-cutting-architecture/).
- Está acoplado a TypeORM, mientras que la persistencia usa MikroORM ([D6](/es/adr/d06-persistence/)).
- Compila sin modo estricto.
- Obliga a que los repositorios de escritura tengan `findByCriteria`.

`apps/web` también necesita value objects, así que el código debe funcionar en el navegador.

## Decisión

Dos paquetes propios, ambos TypeScript sin framework y en modo estricto.

- `@house-radar/building-blocks`: bloques DDD genéricos sin conceptos de House Radar. El agregado mantiene su propio búfer de eventos (`record()`, `peekDomainEvents()`, `clearDomainEvents()`) y la infraestructura publica en el `EventBus` de Nest. Conserva del kit la base de value object con `validate()` obligatorio, el envoltorio de eventos, la base de builder, `Criteria` y los puertos de repositorio de lectura y escritura separados.
- `@house-radar/shared-kernel`: conceptos de House Radar usados por dos o más contextos (`Money`, `Area`, `GeoPoint`, catálogos cerrados, procedencia e identidades entre contextos). Depende de `building-blocks`.

Los detalles están en [Convenciones de código](/es/architecture/conventions/).

## Consecuencias

- El dominio queda libre de NestJS y TypeORM; `apps/web` puede reutilizar los mismos value objects.
- Mantenemos el código base y sus tests ([D14](/es/adr/d14-testing/)).
- Las buenas ideas del kit se portan con correcciones: igualdad tipada y segura ante nulos, `Criteria` inmutable, fechas inválidas rechazadas, `DomainException` con `code` y `cause`, sin `any` en los filtros.
- Un value object nace en su contexto y pasa a `shared-kernel` solo cuando un segundo contexto lo necesita.
- Las correcciones del kit no llegan automáticamente a este proyecto.
- Sustituida en parte por [D31](/es/adr/d31-transactional-outbox/) y [D32](/es/adr/d32-uuid-v7/): la infraestructura ya no publica los eventos en el `EventBus` tras guardar, sino que se persisten en un outbox, y los UUID son v7 generados con el paquete `uuid` en lugar de `randomUUID()`.

## Alternativas consideradas

- **Depender de `@sisques-labs/nestjs-kit` tal cual:** es lo que menos código requiere. Descartada por el acoplamiento del dominio con un framework, la dependencia de TypeORM y la compilación no estricta.
- **Híbrido (usar el kit para algunas piezas y código propio para el resto):** descartada porque dos orígenes de clases base difuminan los límites y las piezas problemáticas (agregado, repositorios) son las centrales.
