---
title: "D31. Outbox transaccional"
description: "Los eventos de dominio se escriben en una tabla outbox en la misma transacción que el agregado; un relay los publica con BullMQ y los consumidores son idempotentes."
sidebar:
  order: 32
---

- **Estado:** Aceptada
- **Fecha:** 2026-11-20

## Contexto

Las proyecciones ([D19](/es/adr/d19-search-read-model/)) y las reacciones entre contextos ([D28](/es/adr/d28-bounded-context-map/)) dependen de los eventos de dominio. [D24](/es/adr/d24-own-building-blocks/) y [D25](/es/adr/d25-cqrs-and-context-structure/) hacían que los handlers de comandos publicaran los eventos extraídos en el `EventBus` de Nest tras guardar, lo que deja una ventana entre el commit y la publicación en la que un fallo pierde los eventos y deja las proyecciones desactualizadas en silencio.

## Decisión

- El repositorio de escritura persiste el agregado y sus eventos de dominio registrados (`peekDomainEvents()`) en una tabla `outbox_event` del mismo esquema, en la misma transacción (unit of work de MikroORM, [D6](/es/adr/d06-persistence/)). O se guarda todo o no se guarda nada. Los eventos se limpian del agregado (`clearDomainEvents()`) solo tras el commit, de modo que un guardado fallido que se reintenta no los pierde.
- Los handlers de comandos ya no llaman a `eventBus.publishAll(...)`.
- Un relay del outbox lee las filas con `published_at is null`, las publica mediante BullMQ ([D7](/es/adr/d07-queues-and-scheduling/)) y las marca como publicadas.
- La entrega es al menos una vez. Los consumidores (proyecciones, handlers entre contextos) son idempotentes y deduplican por ID de evento con una tabla `processed_event (event_id, consumer)` ([D23](/es/adr/d23-ingestion-concurrency-model/)).
- Cada esquema que emite eventos (`ingestion`, `listings`, `properties`, `identity`) tiene su propia tabla `outbox_event`.
- El outbox funciona además como registro de eventos auditable que puede reproducirse para reconstruir proyecciones.

Los detalles están en [Esquema de base de datos](/es/architecture/database-schema/) y [Convenciones de código](/es/architecture/conventions/).

## Consecuencias

- Un evento no puede perderse entre el commit y la publicación.
- Los eventos pueden reproducirse para reconstruir proyecciones cuando cambian las reglas de consolidación.
- La publicación es asíncrona: las proyecciones son eventualmente consistentes, con un pequeño retraso marcado por el relay.
- Hay que operar y observar un relay y una política de retención de las filas publicadas ([D15](/es/adr/d15-observability/)).
- Los consumidores deben ser idempotentes y registrarse en `processed_event`.
- El orden de entrega no está garantizado (varios workers de BullMQ): cada fila del outbox lleva `aggregate_version` y los consumidores aplican un evento solo si es más reciente que la versión ya aplicada (`properties.projected_listing.version`), de modo que un evento tardío nunca sobrescribe un estado más nuevo.
- Sustituye en parte la publicación de eventos descrita en D24 y D25.

## Alternativas consideradas

- **Publicación en proceso tras el commit más reconstrucción periódica de proyecciones:** más simple, pero un fallo entre el commit y la publicación deja las proyecciones desactualizadas hasta la siguiente reconstrucción, que pueden ser horas, lo que contradice el principio de producto de datos fiables. Descartada.
