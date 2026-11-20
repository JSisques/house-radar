---
title: "D23. Modelo de concurrencia de la ingesta"
description: "La ingesta escala repartiendo el trabajo entre workers idénticos y sin estado, con colas y límites de tasa por fuente, y se apoya en la idempotencia en lugar de en bloqueos distribuidos."
sidebar:
  order: 24
---

- **Estado:** Aceptada
- **Fecha:** 2026-11-20

## Contexto

House Radar ingiere anuncios de N fuentes ([D3](/es/adr/d03-source-strategy/)): la idealista Search API, feeds autorizados de inmobiliarias e importación manual. `apps/ingestion` ([D4](/es/adr/d04-backend-framework/)) funciona sobre BullMQ + Redis ([D7](/es/adr/d07-queues-and-scheduling/)). Los workers de ingesta deben escalar sin colisionar entre sí, y cada fuente tiene su propia cuota, que debe respetarse sin importar cuántos workers estén en ejecución.

## Decisión

Escalar el trabajo, no «un worker por fuente».

1. **La planificación se separa de la ejecución.** Los jobs repetibles de BullMQ encolan `sync-source(<source>)`. Los workers de ingesta son réplicas idénticas y sin estado que solo consumen jobs (`docker compose up --scale ingestion=N`).
2. **Reclamación atómica de jobs.** BullMQ mueve un job a activo de forma atómica con un bloqueo (lock). Si un worker muere, el lock caduca y otro worker reintenta el job (recuperación de jobs estancados).
3. **Fan-out.** `sync-source` descubre los anuncios y encola un job `fetch-listing(<source>, <externalId>)` por anuncio, de modo que N workers se reparten el trabajo de una misma fuente.
4. **IDs de job deterministas**, por ejemplo `fetch.<source>.<externalId>.<runId>`, para que el mismo job no se encole dos veces dentro de una ejecución.
5. **Una cola por fuente con su propio limitador de tasa.** El limitador de BullMQ es global por cola (compartido por todos los workers), por lo que la cuota de cada fuente se respeta sin importar el número de workers. Los «grupos» de BullMQ (una sola cola con límites por grupo) son una funcionalidad de pago de la versión Pro y no se usan.
6. **La base de datos es la última línea de defensa** ([D6](/es/adr/d06-persistence/)):
   - Unicidad `(source, external_id)` más upsert: el mismo anuncio se actualiza, nunca se duplica (véase la enmienda de [D21](/es/adr/d21-duplicate-detection-policy/)).
   - Las observaciones son de solo añadir (append-only) e inmutables, con unicidad por `(listing, run)`.
   - El agregado Property usa bloqueo optimista (`version` de MikroORM) para la vinculación de duplicados y el recálculo del precio representativo.
7. **Los conectores son adaptadores de un mismo puerto.** Cada conector implementa el mismo puerto (`discover()`, `fetch(externalId)`) y devuelve el modelo normalizado ([D10](/es/adr/d10-cross-cutting-architecture/)). Añadir una fuente supone un nuevo adaptador más el registro de su cola; los workers no cambian.

Principio: hacer inofensiva la duplicación concurrente (idempotencia) en lugar de depender de bloqueos distribuidos hechos a mano.

El flujo se ilustra en [Concurrencia de la ingesta](/es/architecture/ingestion-concurrency/). La visibilidad operativa de colas y jobs sigue [D15](/es/adr/d15-observability/).

## Consecuencias

- El rendimiento escala horizontalmente cambiando el número de réplicas, sin cambios de código ni de configuración por fuente.
- Una fuente grande se procesa en paralelo por todos los workers.
- Las cuotas por fuente se respetan sin importar el número de workers.
- La caída de un worker no pierde trabajo: otra réplica reintenta sus jobs.
- Que dos workers procesen el mismo anuncio es un caso inofensivo, no un error: la base de datos garantiza el estado final.
- El fan-out crea muchos jobs pequeños por ejecución, lo que aumenta el tráfico en Redis y exige observabilidad por job (Bull Board, métricas).
- Cada cola necesita su limitador de tasa configurado al añadir una fuente.

## Alternativas consideradas

- **Un worker dedicado por fuente:** no escala dentro de una fuente (una fuente grande queda limitada a un worker) y deja capacidad ociosa cuando una fuente no tiene trabajo.
- **Bloqueos distribuidos hechos a mano:** propensos a errores (caducidad, desajuste de relojes, liberaciones olvidadas). Se prefiere la idempotencia porque sigue siendo correcta aunque el bloqueo falle.
- **Grupos de BullMQ Pro:** permitirían una sola cola con límites por grupo, pero es una funcionalidad de pago. Una cola por fuente logra el mismo resultado con la librería de código abierto.
