---
title: Agregados
description: Agregados de cada bounded context con su identidad, estado, invariantes, eventos y proyecciones.
sidebar:
  order: 2
---

Decisión [D29](/es/adr/d29-aggregate-boundaries/): los agregados son pequeños y protegen invariantes; los datos derivados viven en proyecciones. Los contextos se definen en [Mapa de contextos](/es/architecture/context-map/) y las tablas en [Esquema de base de datos](/es/architecture/database-schema/). Los términos se definen en [Lenguaje ubicuo](/es/domain/ubiquitous-language/). Los eventos se entregan mediante el outbox transaccional ([D31](/es/adr/d31-transactional-outbox/)); todo ID es un UUIDv7 ([D32](/es/adr/d32-uuid-v7/)).

## `ingestion`

### `Source`

- **Identidad:** `SourceId`, un UUIDv7 generado al crear la fuente. La fuente `manual` es la de tipo `manual`, que se busca por tipo y nunca por un id fijo.
- **Estado:** tipo (`api`, `feed`, `manual`) y un indicador de habilitada. La cadencia y el límite de tasa vienen de la configuración del despliegue, no del agregado.
- **Eventos:** ninguno.

### `IngestionRun`

- **Identidad:** `IngestionRunId`.
- **Estado:** fuente, hora de inicio y fin, estado (`running`, `succeeded`, `partial`, `failed`) y contadores (descubiertos, procesados, fallidos).
- **Invariantes:** una ejecución se cierra una sola vez; su estado se deriva de sus contadores.
- **Eventos:** `IngestionRunCompleted`, `IngestionRunFailed` (alimentan las alertas de HR-F012).
- **Desaparición:** al cerrar una ejecución, `ingestion` indica a `listings` qué anuncios de esa fuente no se vieron. Solo informa; `listings` decide.

### `ExtractionError`

- Registro append-only separado, referenciado por `runId`. Una ejecución puede acumular muchos errores, por lo que no forman parte de `IngestionRun` (mismo razonamiento que `Observation`).

## `listings`

### `Listing`

El anuncio y su estado actual.

- **Identidad:** `ListingId` más la procedencia: `SourceId`, `ExternalId` opcional y `ListingUrl`. La unicidad es `(source, external_id)` ([D23](/es/adr/d23-ingestion-concurrency-model/)); para anuncios manuales, la URL normalizada.
- **Estado:** atributos declarados como `Known<T> | Unknown` (tipo, superficies, dormitorios, baños, estado, características, certificado energético, etc.), `GeoPoint` y `LocationPrecision`, precio actual, estado (`active`, `disappeared`, `unknown`), `missedRuns` y fecha de última comprobación.
- **Invariantes:**
  - El precio y el estado cambian solo mediante una nueva observación.
  - Un anuncio desaparecido que se observa de nuevo pasa a `active`.
  - `missedRuns` se reinicia con cada observación; con N = 3 el anuncio pasa a `disappeared` ([D20](/es/adr/d20-listing-consolidation-rules/)).
  - Las correcciones descriptivas quedan auditadas.
- **Eventos:** `ListingObserved`, `ListingPriceChanged`, `ListingDisappeared`, `ListingReappeared`, `ListingDetailsCorrected`.

### `Observation`

Agregado propio, referenciado por `ListingId`.

- **Estado:** precio, estado, fecha observada y la ejecución que la produjo (ninguna en una comprobación manual).
- **Invariantes:** inmutable y append-only; única por `(listing, run)` ([D23](/es/adr/d23-ingestion-concurrency-model/)).
- **Por qué es separado:** las observaciones se conservan para siempre; un anuncio activo revisado a diario acumula cientos al año. Dentro de `Listing` el agregado crecería sin límite. `Observation` no comparte ninguna invariante con `Listing` salvo «se escriben juntos», que el handler del comando garantiza persistiendo ambos en la misma transacción.

## `properties`

### `Property`

Mínima por diseño.

- **Identidad:** `PropertyId`.
- **Estado:** IDs de los anuncios miembros y la ubicación elegida (la más precisa por defecto; el usuario puede cambiarla).
- **Invariantes:**
  - Un anuncio pertenece a exactamente una propiedad.
  - La ubicación elegida es la de uno de sus anuncios o un punto válido fijado por el usuario.
- **Eventos:** `PropertiesMerged` (cuando se elimina una propiedad porque sus anuncios pasaron a otra).

### `DuplicateCandidate`

- **Identidad:** `DuplicateCandidateId`; un par de anuncios.
- **Estado:** estado `suggested`, `linked` o `dismissed`.
- **Invariantes:** un par descartado no se vuelve a sugerir ([D21](/es/adr/d21-duplicate-detection-policy/)).

### Ciclo de vida de la propiedad

1. **Crear (1:1).** Cada anuncio nuevo recibe su propia `Property`.
2. **Vincular.** Confirmar un duplicado como «misma propiedad» mueve el anuncio a la otra propiedad.
3. **Eliminar la vacía.** Una propiedad sin anuncios se elimina y se emite `PropertiesMerged`.
4. **Desvincular.** Desvincular mueve el anuncio de vuelta a una propiedad nueva.

### Proyecciones

Modelos de lectura actualizados desde eventos de `listings`. El agregado protege invariantes; los datos derivados se calculan para lectura y pueden reconstruirse desde eventos y observaciones si cambian las reglas de consolidación.

| Proyección | Contenido |
| --- | --- |
| `property_search_view` | Atributos consolidados con conflictos ([D20](/es/adr/d20-listing-consolidation-rules/)), precio representativo ([D19](/es/adr/d19-search-read-model/)), municipio y ubicación. La usan la búsqueda, la ficha y el dashboard. |
| `property_price_point` | Evolución del precio activo más bajo por propiedad. |

## `geography`

Datos de referencia de solo lectura, cargados por un script de importación desde el IGN; solo Galicia en el MVP. No tiene agregados ni emite eventos.

- **`Municipality`:** código INE, nombre, provincia y polígono de límites.
- **`Province`:** código y nombre.

## `identity`

### `Account`

- **Identidad:** `AccountId`.
- **Estado:** email, hash de la contraseña, intentos fallidos de acceso, `lockedUntil` y rol (un único rol, preparado para más).
- **Invariantes:** cinco intentos fallidos bloquean la cuenta durante 15 minutos ([D13](/es/adr/d13-users-and-authentication/)).
- **Eventos:** `AccountCreated`.
- Las sesiones son infraestructura (Redis), no un agregado.

## `users`

### `UserProfile`

- **Identidad:** el mismo ID que la `Account`.
- **Estado:** zona horaria.

### `Favorite`

- Agregado propio: la propiedad favorita de un usuario. Único `(user, property)`.

### `SavedSearch`

- **Estado:** nombre y filtros como value object (los mismos parámetros de búsqueda validados por TanStack Router).
- **Invariantes:** el nombre es único por usuario.

### `PropertiesMerged` y favoritos

`users` escucha `PropertiesMerged` y reasigna los favoritos de la propiedad eliminada a la que sobrevive, deduplicando: si el usuario ya tenía la propiedad superviviente como favorita, el favorito duplicado se descarta. El handler es idempotente ([D31](/es/adr/d31-transactional-outbox/)).

## Resumen de eventos

| Evento | Emitido por | Consumido por |
| --- | --- | --- |
| `ListingObserved`, `ListingPriceChanged`, `ListingDisappeared` | `listings` | `properties` |
| `ListingReappeared`, `ListingDetailsCorrected` | `listings` | `properties` (proyecciones) |
| `PropertiesMerged` | `properties` | `users` |
| `AccountCreated` | `identity` | `users` |
| `IngestionRunCompleted`, `IngestionRunFailed` | `ingestion` | Alertas (HR-F012) |
