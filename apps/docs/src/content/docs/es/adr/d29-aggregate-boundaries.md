---
title: "D29. Límites de los agregados"
description: "Observation y ExtractionError son agregados append-only propios, Property es mínima y los datos derivados de la consolidación viven en proyecciones."
sidebar:
  order: 30
---

- **Estado:** Aceptada
- **Fecha:** 2026-11-20

## Contexto

Con los contextos definidos ([D28](/es/adr/d28-bounded-context-map/)), necesitamos límites de agregado que protejan invariantes sin crecer sin control ni convertirse en cuello de botella bajo ingesta concurrente ([D23](/es/adr/d23-ingestion-concurrency-model/)). Un anuncio activo revisado a diario acumula cientos de observaciones al año, y una ejecución puede acumular muchos errores de extracción. Los atributos consolidados y el precio representativo ([D19](/es/adr/d19-search-read-model/), [D20](/es/adr/d20-listing-consolidation-rules/)) son datos derivados que pueden cambiar si cambian las reglas.

## Decisión

1. **`Observation` es un agregado propio** de `listings`, referenciado por `ListingId`. Es inmutable y append-only (precio, estado, fecha observada, ejecución), único por `(listing, run)`. No comparte ninguna invariante con `Listing` salvo «se escriben juntos», que el handler del comando garantiza persistiendo ambos en la misma transacción.
2. **`Listing` contiene solo el estado actual**: atributos declarados, ubicación y precisión, precio actual, estado, `missedRuns`. El precio y el estado cambian solo mediante una nueva observación; las correcciones descriptivas quedan auditadas.
3. **`Property` es mínima**: identidad, IDs de los anuncios miembros y ubicación elegida. Invariantes: un anuncio pertenece a exactamente una propiedad; la ubicación elegida es la de uno de sus anuncios o un punto válido fijado por el usuario.
4. **Ciclo de vida de la propiedad**: cada anuncio nuevo recibe su propia `Property` (1:1). Confirmar un duplicado mueve el anuncio a la otra propiedad; una propiedad sin anuncios se elimina; desvincular mueve el anuncio a una propiedad nueva. `DuplicateCandidate` es un par con estado `suggested`, `linked` o `dismissed`; un par descartado no se vuelve a sugerir ([D21](/es/adr/d21-duplicate-detection-policy/)).
5. **Los datos derivados son proyecciones, no estado del agregado.** `property_search_view` (atributos consolidados, conflictos, precio representativo, municipio) y la evolución del precio activo más bajo son modelos de lectura actualizados desde eventos de `listings` y reconstruibles.
6. **`ExtractionError` es un registro append-only separado** en `ingestion`, referenciado por `runId`, por la misma razón que `Observation`.
7. La desaparición la decide `listings`: `ingestion` informa de los anuncios no vistos al cerrar una ejecución, `Listing` incrementa `missedRuns` (se reinicia con cada observación) y pasa a `disappeared` con N = 3 ([D20](/es/adr/d20-listing-consolidation-rules/)).

Los detalles están en [Agregados](/es/domain/aggregates/).

## Consecuencias

- Los agregados se mantienen pequeños: cargar un `Listing` nunca carga su histórico y las escrituras concurrentes solo compiten por las filas que cambian.
- Las observaciones y los errores pueden crecer sin límite sin afectar al tamaño del agregado.
- Persistir un anuncio y su observación en una transacción es responsabilidad del handler, no una invariante del agregado.
- Las reglas de consolidación pueden cambiar y las proyecciones recalcularse desde eventos y observaciones sin migrar agregados.
- La búsqueda y la ficha dependen de que las proyecciones estén al día, así que la entrega de eventos debe ser fiable ([D31](/es/adr/d31-transactional-outbox/)).
- Más tablas y agregados que un único modelo grande.

## Alternativas consideradas

- **`Observation` dentro de `Listing`:** un único límite de consistencia, pero el agregado crece sin límite y cada revisión de precio carga y bloquea todo el histórico. Descartada.
- **`Property` completa con datos derivados (atributos consolidados, precio representativo):** el agregado cargaría datos que se recalculan con cada cambio de anuncio, aumentando la contención y mezclando invariantes con necesidades de lectura. Descartada a favor de un agregado mínimo más proyecciones.
