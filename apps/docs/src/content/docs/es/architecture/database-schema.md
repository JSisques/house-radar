---
title: Esquema de base de datos
description: Esquema de PostgreSQL por bounded context, reglas de diseño y tablas.
sidebar:
  order: 5
---

Decisión [D30](/es/adr/d30-schema-per-context/): un esquema de PostgreSQL por bounded context, con las tablas descritas a continuación. Los contextos se definen en [Mapa de contextos](/es/architecture/context-map/) y los agregados en [Agregados](/es/domain/aggregates/). El modelo se diseña antes del código; los detalles de las columnas pueden refinarse durante la implementación.

## Reglas de diseño

- Un esquema por contexto: `ingestion`, `listings`, `properties`, `geography`, `identity`, `users`.
- Sin claves foráneas entre esquemas: los contextos se referencian por ID. Dentro de un esquema las claves foráneas están permitidas. Las lecturas entre contextos pasan por proyecciones, nunca por `JOIN` entre esquemas.
- Cada contexto posee sus migraciones y sus permisos.
- Las claves primarias son `uuid` v7 ([D32](/es/adr/d32-uuid-v7/)), salvo indicación contraria. Las filas mutables tienen `created_at` y `updated_at timestamptz not null`; las tablas append-only solo `created_at`.
- El dinero es `bigint` en céntimos. Las ubicaciones son `geography(Point, 4326)` (radio en metros con `ST_DWithin`). Los límites municipales son `geometry(MultiPolygon, 4326)`.
- Los valores desconocidos son `NULL`, más una columna de origen (`declared`, `calculated`, `inferred`) donde el origen importe.
- Los enums son `text` con restricciones `check` (catálogos cerrados de las especificaciones de las features).

## Tablas

### `ingestion`

Fuentes, ejecuciones y errores de extracción ([D23](/es/adr/d23-ingestion-concurrency-model/)).

#### `ingestion.source`

Mutable.

| Columna | Tipo | Notas |
| --- | --- | --- |
| `id` | `uuid` | Clave primaria, un UUIDv7. |
| `name` | `text not null` | Nombre de la fuente (`idealista`, `fotocasa`, `manual`), único. |
| `kind` | `text not null` | `api`, `feed` o `manual` (check). |
| `enabled` | `boolean not null` | Si la fuente se ingiere. |
| `created_at` | `timestamptz not null` | Momento de creación de la fila. |
| `updated_at` | `timestamptz not null` | Momento de la última actualización. |

#### `ingestion.ingestion_run`

Una ejecución de una fuente.

| Columna | Tipo | Notas |
| --- | --- | --- |
| `id` | `uuid` | Clave primaria (UUIDv7). |
| `source_id` | `uuid not null` | Referencia a la fuente (mismo esquema). |
| `started_at` | `timestamptz not null` | Inicio. |
| `finished_at` | `timestamptz null` | Fin. |
| `status` | `text not null` | `running`, `succeeded`, `partial` o `failed` (check). |
| `discovered_count` | `int not null` | Anuncios descubiertos. |
| `processed_count` | `int not null` | Anuncios procesados. |
| `failed_count` | `int not null` | Anuncios fallidos. |
| `created_at` | `timestamptz not null` | Momento de creación de la fila. |
| `updated_at` | `timestamptz not null` | Momento de la última actualización. |

Restricciones e índices:

- Índice `(source_id, started_at desc)`.

#### `ingestion.extraction_error`

Append-only; no tiene `updated_at`.

| Columna | Tipo | Notas |
| --- | --- | --- |
| `id` | `uuid` | Clave primaria (UUIDv7). |
| `run_id` | `uuid not null` | Ejecución que produjo el error (mismo esquema). |
| `external_id` | `text null` | ID externo del anuncio, si se conoce. |
| `message` | `text not null` | Descripción del error. |
| `occurred_at` | `timestamptz not null` | Cuándo ocurrió el error. |
| `created_at` | `timestamptz not null` | Momento de creación de la fila. |

Restricciones e índices:

- Índice `(run_id)`.

Además tiene: `outbox_event` (véase más abajo).

### `listings`

Anuncios, sus observaciones y correcciones ([D29](/es/adr/d29-aggregate-boundaries/)).

#### `listings.listing`

Estado actual del anuncio. Los valores desconocidos son `NULL`; se añade `<attr>_origin` (`declared`, `calculated`, `inferred`) donde el origen importa ([D20](/es/adr/d20-listing-consolidation-rules/)).

| Columna | Tipo | Notas |
| --- | --- | --- |
| `id` | `uuid` | Clave primaria (UUIDv7). |
| `source_id` | `uuid not null` | Procedencia: fuente (referencia por ID, sin clave foránea entre esquemas). |
| `external_id` | `text null` | Procedencia: ID en la fuente. |
| `url` | `text not null` | Procedencia: URL original. |
| `normalized_url` | `text not null` | URL normalizada. |
| `property_type` | `text null` | Atributo declarado, catálogo cerrado (check). |
| `condition` | `text null` | Atributo declarado, catálogo cerrado (check). |
| `built_area_m2` | `numeric null` | Superficie construida. |
| `usable_area_m2` | `numeric null` | Superficie útil. |
| `plot_area_m2` | `numeric null` | Superficie de parcela. |
| `bedrooms` | `int null` | Número de dormitorios. |
| `bathrooms` | `int null` | Número de baños. |
| `year_built` | `int null` | Año de construcción. |
| `has_garage, has_garden, has_pool, has_terrace, has_balcony, has_elevator, has_heating` | `boolean null` | Características anulables: `NULL` significa desconocido, no «no». |
| `energy_certificate` | `text null` | Calificación del certificado energético. |
| `title` | `text null` | Título del anuncio. |
| `description` | `text null` | Descripción del anuncio. |
| `location` | `geography(Point,4326)` | Pin del anuncio. |
| `location_precision` | `text not null` | `exact`, `approximate` o `municipality` ([D18](/es/adr/d18-location-pin-declared-precision/)). |
| `postal_code` | `text null` | Introducido a mano. |
| `current_price_cents` | `bigint` | Precio actual en céntimos. |
| `status` | `text not null` | `active`, `disappeared` o `unknown` (check). |
| `missed_runs` | `int not null` | Ejecuciones consecutivas sin ver el anuncio. |
| `published_at` | `timestamptz null` | Fecha de publicación, si se conoce. |
| `first_seen_at` | `timestamptz not null` | Primera observación. |
| `last_checked_at` | `timestamptz not null` | Última observación o comprobación. |
| `version` | `int not null` | Bloqueo optimista ([D23](/es/adr/d23-ingestion-concurrency-model/)). |
| `created_at` | `timestamptz not null` | Momento de creación de la fila. |
| `updated_at` | `timestamptz not null` | Momento de la última actualización. |

Restricciones e índices:

- Único `(source_id, external_id)` donde `external_id is not null`.
- Único `(normalized_url)` para anuncios manuales.
- Índice GiST sobre `location`.

#### `listings.observation`

Append-only; no tiene `updated_at`.

| Columna | Tipo | Notas |
| --- | --- | --- |
| `id` | `uuid` | Clave primaria (UUIDv7). |
| `listing_id` | `uuid not null` | Anuncio observado (mismo esquema). |
| `run_id` | `uuid null` | Ejecución que la produjo; `NULL` en comprobaciones manuales (referencia por ID, sin clave foránea entre esquemas). |
| `price_cents` | `bigint not null` | Precio observado en céntimos. |
| `status` | `text not null` | Estado observado. |
| `observed_at` | `timestamptz not null` | Fecha de la observación. |
| `created_at` | `timestamptz not null` | Momento de creación de la fila. |

Restricciones e índices:

- Único `(listing_id, run_id)` donde `run_id is not null`.
- Índice `(listing_id, observed_at)`.

Implementado en la migración `Migration20261125000106` (S-M1-03). Cubre solo lo que los agregados modelan hoy:

- `listings.listing` aún no tiene `location`, `location_precision`, `postal_code`, `missed_runs` ni `published_at`; llegarán con los cortes que los modelen.
- Las columnas `<attr>_origin` se sustituyen por una sola columna `origins jsonb` (nombre del atributo a `declared|calculated|inferred`; los atributos desconocidos no tienen entrada). También tiene `land_type`, `has_water`, `has_electricity` y `has_sanitation`, y un `version int` para el bloqueo optimista.
- `url` y `normalized_url` guardan ambas la URL normalizada. El único `(normalized_url)` aplica a los anuncios manuales (`external_id is null`).
- `listings.observation` añade `price_origin text`, `snapshot jsonb` y `version int`.
- Reingestar un `(source_id, external_id)` existente actualiza la fila guardada y conserva su `id`.

#### `listings.listing_correction`

Auditoría de correcciones descriptivas; append-only.

| Columna | Tipo | Notas |
| --- | --- | --- |
| `id` | `uuid` | Clave primaria (UUIDv7). |
| `listing_id` | `uuid not null` | Anuncio corregido. |
| `field` | `text not null` | Campo corregido. |
| `old_value` | `text null` | Valor anterior. |
| `new_value` | `text null` | Valor nuevo. |
| `corrected_at` | `timestamptz not null` | Momento de la corrección. |
| `created_at` | `timestamptz not null` | Momento de creación de la fila. |

Además tiene: `outbox_event` (véase más abajo).

### `properties`

Propiedades, candidatos a duplicado y proyecciones ([D29](/es/adr/d29-aggregate-boundaries/)).

#### `properties.property`

Agregado mínimo.

| Columna | Tipo | Notas |
| --- | --- | --- |
| `id` | `uuid` | Clave primaria (UUIDv7). |
| `chosen_location` | `geography(Point,4326)` | Ubicación elegida. |
| `chosen_location_precision` | `text not null` | Precisión de la ubicación elegida. |
| `version` | `int not null` | Bloqueo optimista. |
| `created_at` | `timestamptz not null` | Momento de creación de la fila. |
| `updated_at` | `timestamptz not null` | Momento de la última actualización. |

#### `properties.property_listing`

Pertenencia de anuncios a propiedades.

| Columna | Tipo | Notas |
| --- | --- | --- |
| `id` | `uuid` | Clave primaria (UUIDv7). |
| `property_id` | `uuid not null` | Clave foránea a `property` (mismo esquema). |
| `listing_id` | `uuid not null` | Anuncio (referencia por ID, sin clave foránea entre esquemas). Único: un anuncio pertenece a exactamente una propiedad. |
| `created_at` | `timestamptz not null` | Momento de creación de la fila. |

Restricciones e índices:

- Único `(listing_id)`.

#### `properties.duplicate_candidate`

Par de anuncios que pueden ser la misma propiedad ([D21](/es/adr/d21-duplicate-detection-policy/)).

| Columna | Tipo | Notas |
| --- | --- | --- |
| `id` | `uuid` | Clave primaria (UUIDv7). |
| `listing_a_id` | `uuid not null` | Primer anuncio del par ordenado (`a < b`). |
| `listing_b_id` | `uuid not null` | Segundo anuncio del par ordenado. |
| `status` | `text not null` | `suggested`, `linked` o `dismissed` (check). |
| `reason` | `text not null` | Motivo de la sugerencia. |
| `resolved_at` | `timestamptz null` | Momento de la resolución. |
| `created_at` | `timestamptz not null` | Momento de creación de la fila. |
| `updated_at` | `timestamptz not null` | Momento de la última actualización. |

Restricciones e índices:

- Check `listing_a_id < listing_b_id`.
- Único `(listing_a_id, listing_b_id)`.

#### `properties.property_search_view`

Proyección usada por la búsqueda, la ficha y el dashboard ([D19](/es/adr/d19-search-read-model/)); reconstruible desde eventos.

| Columna | Tipo | Notas |
| --- | --- | --- |
| `property_id` | `uuid` | Clave primaria. |
| (consolidated attributes) | `several` | Tipo, superficies, dormitorios, baños, características, etc., consolidados entre anuncios. |
| `conflicts` | `jsonb` | Conflictos de atributos con cada valor y su fuente ([D20](/es/adr/d20-listing-consolidation-rules/)). |
| `representative_price_cents` | `bigint null` | Menor precio entre los anuncios activos. |
| `active_listing_count` | `int not null` | Anuncios activos. |
| `listing_count` | `int not null` | Todos los anuncios. |
| `municipality_code` | `text` | Código INE (referencia por ID). |
| `province_code` | `text` | Código de provincia (referencia por ID). |
| `location` | `geography` | Ubicación elegida. |
| `location_precision` | `text` | Precisión. |
| `price_per_m2_cents` | `bigint null` | Calculado solo con la superficie construida. |
| `first_seen_at` | `timestamptz` | Primera observación de sus anuncios. |
| `last_updated_at` | `timestamptz` | Última actualización de la proyección. |

Restricciones e índices:

- Índice GiST sobre `location`.
- Índices B-tree sobre precio, superficies, tipo y municipio.

#### `properties.projected_listing`

Estado por anuncio tal como lo aplicaron por última vez las proyecciones; las filas de propiedad de `property_search_view` se recalculan a partir de él. Protección de orden: un evento de anuncio se aplica solo si su `aggregate_version` es mayor que `version`.

| Columna | Tipo | Notas |
|---|---|---|
| `listing_id` | `uuid pk` | Anuncio (de `listings`, sin FK). |
| `property_id` | `uuid not null` | Propiedad a la que pertenece. |
| `version` | `int not null` | Última versión aplicada del anuncio. |
| `price_cents` | `bigint null` | Último precio aplicado. |
| `status` | `text not null` | Último estado aplicado. |

#### `properties.property_price_point`

Proyección: evolución del precio activo más bajo.

| Columna | Tipo | Notas |
| --- | --- | --- |
| `property_id` | `uuid not null` | Propiedad. |
| `observed_at` | `timestamptz not null` | Instante. |
| `lowest_active_price_cents` | `bigint` | Menor precio entre los anuncios activos en ese momento. |

Restricciones e índices:

- Índice `(property_id, observed_at)`.

Además tiene: `processed_event`, `outbox_event` (véase más abajo).

### `geography`

Datos de referencia de solo lectura cargados desde el IGN.

#### `geography.province`

Provincias.

| Columna | Tipo | Notas |
| --- | --- | --- |
| `code` | `text` | Clave primaria. |
| `name` | `text not null` | Nombre de la provincia. |

#### `geography.municipality`

Municipios.

| Columna | Tipo | Notas |
| --- | --- | --- |
| `code` | `text` | Clave primaria, código INE. |
| `name` | `text not null` | Nombre del municipio. |
| `province_code` | `text not null` | Provincia (mismo esquema). |
| `boundary` | `geometry(MultiPolygon,4326)` | Límite para punto en polígono. |

Restricciones e índices:

- Índice GiST sobre `boundary`.

### `identity`

Cuentas ([D13](/es/adr/d13-users-and-authentication/)).

#### `identity.account`

Mutable.

| Columna | Tipo | Notas |
| --- | --- | --- |
| `id` | `uuid` | Clave primaria (UUIDv7). |
| `email` | `text not null` | En minúsculas; único. |
| `password_hash` | `text not null` | Hash de la contraseña. |
| `role` | `text not null` | Un único rol por ahora (check). |
| `failed_sign_in_attempts` | `int not null` | Fallos consecutivos. |
| `locked_until` | `timestamptz null` | Fin del bloqueo. |
| `created_at` | `timestamptz not null` | Momento de creación de la fila. |
| `updated_at` | `timestamptz not null` | Momento de la última actualización. |

Restricciones e índices:

- Único `(email)`.

Además tiene: `outbox_event` (véase más abajo).

### `users`

Perfiles, favoritos y búsquedas guardadas.

#### `users.user_profile`

Mutable.

| Columna | Tipo | Notas |
| --- | --- | --- |
| `id` | `uuid` | Clave primaria; igual al ID de la cuenta (referencia por ID). |
| `time_zone` | `text not null` | Zona horaria IANA. |
| `created_at` | `timestamptz not null` | Momento de creación de la fila. |
| `updated_at` | `timestamptz not null` | Momento de la última actualización. |

#### `users.favorite`

Propiedad favorita de un usuario.

| Columna | Tipo | Notas |
| --- | --- | --- |
| `id` | `uuid` | Clave primaria (UUIDv7). |
| `user_id` | `uuid not null` | Perfil de usuario (mismo esquema). |
| `property_id` | `uuid not null` | Propiedad (referencia por ID, sin clave foránea entre esquemas). |
| `created_at` | `timestamptz not null` | Momento de creación de la fila. |

Restricciones e índices:

- Único `(user_id, property_id)`.

#### `users.saved_search`

Filtros de una búsqueda guardada.

| Columna | Tipo | Notas |
| --- | --- | --- |
| `id` | `uuid` | Clave primaria (UUIDv7). |
| `user_id` | `uuid not null` | Perfil de usuario (mismo esquema). |
| `name` | `text not null` | Nombre de la búsqueda. |
| `filters` | `jsonb not null` | Parámetros de búsqueda (misma forma validada por el router). |
| `created_at` | `timestamptz not null` | Momento de creación de la fila. |
| `updated_at` | `timestamptz not null` | Momento de la última actualización. |

Restricciones e índices:

- Único `(user_id, name)`.

Además tiene: `processed_event` (véase más abajo).

## Outbox

Cada esquema que emite eventos (`ingestion`, `listings`, `properties`, `identity`) tiene una tabla `outbox_event` ([D31](/es/adr/d31-transactional-outbox/)). El repositorio de escritura inserta los eventos extraídos del agregado en la misma transacción; un relay publica las filas sin publicar mediante BullMQ y rellena `published_at`. La tabla es además un registro de eventos auditable que puede reproducirse para reconstruir proyecciones.

| Columna | Tipo | Notas |
| --- | --- | --- |
| `id` | `uuid` | Clave primaria; igual al ID del evento (UUIDv7). |
| `aggregate_type` | `text not null` | Tipo del agregado emisor. |
| `aggregate_id` | `uuid not null` | Agregado emisor. |
| `aggregate_version` | `int not null` | Versión del agregado producida por el cambio; los consumidores ignoran eventos más antiguos que la versión ya aplicada (protección de orden). |
| `event_type` | `text not null` | Nombre del evento, por ejemplo `ListingPriceChanged`. |
| `schema_version` | `int not null` | Versión del esquema del payload. |
| `payload` | `jsonb not null` | Datos del evento. |
| `metadata` | `jsonb not null` | IDs de correlación y causalidad. |
| `occurred_at` | `timestamptz not null` | Cuándo ocurrió el evento. |
| `published_at` | `timestamptz null` | `NULL` hasta que el relay lo publica. |

Restricciones e índices:

- Índice parcial sobre `occurred_at` donde `published_at is null`.

## Eventos procesados

`properties` y `users` consumen eventos, por lo que cada uno tiene una tabla `processed_event` que hace idempotentes a los consumidores: un consumidor inserta `(event_id, consumer)` y omite el evento si ya existe.

| Columna | Tipo | Notas |
| --- | --- | --- |
| `event_id` | `uuid not null` | ID del evento procesado. |
| `consumer` | `text not null` | Nombre del consumidor. |
| `processed_at` | `timestamptz not null` | Momento del procesamiento. |

Restricciones e índices:

- Clave primaria `(event_id, consumer)`.
