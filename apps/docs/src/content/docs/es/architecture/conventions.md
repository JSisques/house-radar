---
title: Convenciones de código
description: Reglas de estructura, capas, nomenclatura, testing y herramientas para el backend, el frontend y los paquetes compartidos.
sidebar:
  order: 3
---

Estas convenciones se aplican a `apps/api`, `apps/ingestion`, `apps/web`, `packages/building-blocks` y `packages/shared-kernel`. Refinan las decisiones [D4](/es/adr/d04-backend-framework/), [D5](/es/adr/d05-frontend-framework/), [D10](/es/adr/d10-cross-cutting-architecture/), [D14](/es/adr/d14-testing/) y [D16](/es/adr/d16-quality-and-workflow/), y se registran en [D24](/es/adr/d24-own-building-blocks/), [D25](/es/adr/d25-cqrs-and-context-structure/), [D26](/es/adr/d26-tanstack-router/) y [D27](/es/adr/d27-react-i18next/).

## Principios

- **Las dependencias apuntan hacia dentro.** `transport` e `infrastructure` dependen de `application`, y `application` depende de `domain`. Nunca al revés.
- **El dominio no tiene framework.** Nada de NestJS, MikroORM, `@nestjs/cqrs` ni React en `domain`. Los decoradores y la inyección de dependencias viven en las capas externas ([D4](/es/adr/d04-backend-framework/), [D10](/es/adr/d10-cross-cutting-architecture/)).
- **Las reglas las impone el lint, no la revisión.** Los límites entre capas, las rutas de importación y su orden son reglas de ESLint. Una regla que no se puede comprobar automáticamente es una regla que se erosiona.
- **Sin archivos barrel.** Se importa desde el archivo que define el símbolo.
- **Un tipo por archivo.** La única excepción es `{Name}CommandInput` / `{Name}QueryInput`, declarado en el archivo del comando o de la consulta.
- **Alias de rutas.** Las importaciones entre directorios usan alias (`@contexts/*`, `@core/*`, `@shared/*`). Las importaciones relativas solo se permiten dentro del mismo directorio.

## Paquetes del monorepo

Ambos paquetes son TypeScript sin framework, en modo estricto.

### `packages/building-blocks` (`@house-radar/building-blocks`)

Bloques DDD genéricos, sin conceptos de House Radar.

| Contenido | Regla |
| --- | --- |
| Base `AggregateRoot` | Mantiene su propio búfer de eventos: `record(event)` y `pullDomainEvents()`. La identidad es cualquier value object de identidad. Igualdad tipada y segura ante nulos. |
| Base de value object | `validate()` obligatorio, una excepción tipada por value object, `toPrimitives()`. |
| Value objects genéricos | String, Number, Uuid, Enum, Date y Boolean configurables por opciones. `DateValueObject` rechaza fechas inválidas y copia defensivamente. |
| Eventos de dominio | Envoltorio con `schemaVersion`, `correlationId`, `causationId` y `occurredAt`; `generateEventMetadata()`. |
| Base de builder | `validate()` lanza `FieldIsRequiredException`. |
| Consultas | `Criteria` inmutable, `PaginatedResult`, `FilterFieldRegistry`. Sin `any` en `Filter.value`. |
| Puertos de repositorio | Puertos de lectura y de escritura separados. |
| `DomainException` | Lleva un `code` y una `cause` opcional. |

Los UUID se generan con `globalThis.crypto.randomUUID()`, de modo que el paquete también funciona en el navegador (`apps/web`). Aquí nunca se añaden value objects específicos del proyecto.

### `packages/shared-kernel` (`@house-radar/shared-kernel`)

Conceptos de House Radar usados por dos o más contextos. Depende de `building-blocks`.

- `Money` (EUR, céntimos enteros), `Area` (m²), `PricePerSquareMeter`.
- `GeoPoint`, `LocationPrecision` ([D18](/es/adr/d18-location-pin-declared-precision/)), `MunicipalityCode`.
- Catálogos cerrados: `PropertyType`, `PropertyCondition`, `EnergyCertificate`.
- Procedencia: `SourceId`, `ExternalId`, `ListingUrl` (normalización de [D17](/es/adr/d17-manual-import-assisted-form/)).
- Identidades entre contextos: `PropertyId`, `ListingId`. Los agregados se referencian entre sí solo por identidad.
- `Known<T> | Unknown`, con el origen del dato (declarado, calculado o inferido).

Un value object nace dentro de su contexto y pasa a `shared-kernel` solo cuando un segundo contexto lo necesita. Los agregados concretos, comandos, consultas, DTO y mapeos del ORM nunca van en ninguno de los dos paquetes.

`apps/api` y `apps/ingestion` usan ambos paquetes. `apps/web` usa `building-blocks` para su propio dominio, y `shared-kernel` solo donde un value object encaja tal cual.

## Backend

Se aplica a `apps/api` y `apps/ingestion`.

### Estructura

Screaming architecture por bounded context. Ejemplo para el contexto `listings`:

```text
src/
├── contexts/
│   └── listings/
│       ├── domain/
│       │   ├── aggregates/listing/listing.aggregate.ts
│       │   ├── value-objects/listing-title/listing-title.value-object.ts
│       │   ├── builders/listing/listing.builder.ts
│       │   ├── events/listing-imported/listing-imported.event.ts
│       │   ├── exceptions/listing-not-found/listing-not-found.exception.ts
│       │   ├── primitives/listing.primitives.ts
│       │   └── repositories/
│       │       ├── listing-write.repository.ts
│       │       └── listing-read.repository.ts
│       ├── application/
│       │   ├── commands/
│       │   │   └── import-manual-listing/
│       │   │       ├── import-manual-listing.command.ts
│       │   │       ├── import-manual-listing.handler.ts
│       │   │       └── import-manual-listing.handler.spec.ts
│       │   ├── queries/
│       │   │   └── property-find-by-id/
│       │   │       ├── property-find-by-id.query.ts
│       │   │       ├── property-find-by-id.handler.ts
│       │   │       └── property-find-by-id.handler.spec.ts
│       │   ├── services/
│       │   │   ├── write/
│       │   │   └── read/assert-property-exists/
│       │   ├── event-handlers/
│       │   └── ports/property-gateway.port.ts
│       ├── infrastructure/
│       │   ├── persistence/mikro-orm/{schemas,mappers,repositories}/
│       │   ├── adapters/
│       │   └── messaging/
│       ├── transport/
│       │   ├── rest/{controllers,dtos,mappers}/
│       │   └── exceptions/
│       └── listings.module.ts
├── core/      # infraestructura de toda la app: config, filtros, health, observabilidad
└── shared/    # piezas de Nest compartidas entre contextos
```

### Capas

| Capa | Contiene | Puede importar |
| --- | --- | --- |
| `domain` | Agregados, value objects, builders, eventos, excepciones de dominio, interfaces de repositorio | `@house-radar/building-blocks`, `@house-radar/shared-kernel` |
| `application` | Comandos, consultas, handlers, servicios, puertos, handlers de eventos | `domain` |
| `infrastructure` | Persistencia, adaptadores, mensajería y todo lo saliente | `application`, `domain` |
| `transport` | Todo lo entrante: controladores REST, DTO, mappers, mapeo de excepciones | `application` (buses), tipos de `domain` |

La comunicación entre contextos va solo a través de un puerto en `application/ports/*.port.ts`, implementado por un adaptador en `infrastructure/adapters/`. Ese directorio es el único lugar donde se puede importar otro contexto. La alternativa son los eventos de dominio.

### CQRS

CQRS con `@nestjs/cqrs` ([D25](/es/adr/d25-cqrs-and-context-structure/)).

- Cada comando y consulta tiene su propia carpeta con su nombre, que contiene el mensaje, su handler y su spec.
- Un comando cambia el estado y devuelve como mucho `{ id }`. Una consulta lee y nunca cambia el estado.
- Los handlers pasan por repositorios y servicios. El transporte pasa solo por `CommandBus` y `QueryBus`.
- Los servicios se dividen en `services/write/` y `services/read/`.
- Los repositorios de escritura exponen solo `save`, `findById` y `delete`. Los de lectura son de solo lectura (`findById`, `findByCriteria`).
- Los eventos de dominio los consumen handlers de eventos y proyecciones, por ejemplo el modelo de lectura del precio representativo ([D19](/es/adr/d19-search-read-model/)). El agregado registra eventos con `record()`; el handler del comando publica `pullDomainEvents()` en el `EventBus`.

### Modelo de dominio

- Los agregados se componen de value objects, nunca de primitivos.
- Los agregados se crean mediante builders y lanzan eventos en métodos con nombre (`create()`, `changePrice()`). `toPrimitives()` los serializa.
- Los builders solo construyen agregados. Los view models los construyen mappers y proyecciones.

### Inyección de dependencias

- Repositorios y puertos se enlazan con tokens `Symbol` (`UPPER_SNAKE`) e interfaces con prefijo `I`.
- Los providers del módulo se agrupan en arrays con nombre: `COMMAND_HANDLERS`, `QUERY_HANDLERS`, `APPLICATION_SERVICES`, `DOMAIN_BUILDERS`, `INFRASTRUCTURE_MAPPERS`, `INFRASTRUCTURE_REPOSITORIES`, `INFRASTRUCTURE_ADAPTERS` y `REST_CONTROLLERS`.
- Los enlaces usan `{ provide, useClass }`. Sin `useExisting`.

```ts
export const LISTING_WRITE_REPOSITORY_TOKEN = Symbol('LISTING_WRITE_REPOSITORY_TOKEN');

export const INFRASTRUCTURE_REPOSITORIES = [
  { provide: LISTING_WRITE_REPOSITORY_TOKEN, useClass: ListingMikroOrmWriteRepository },
];
```

### Persistencia

MikroORM mapeado con `EntitySchema` ([D6](/es/adr/d06-persistence/)), de modo que las clases de dominio no llevan decoradores del ORM. Los schemas, mappers y repositorios viven en `infrastructure/persistence/mikro-orm/`. Los mappers traducen entre entidades del schema y agregados.

### Transporte

Solo REST ([D22](/es/adr/d22-api-style/)): sin GraphQL ni MCP. Los controladores validan la entrada con DTO, envían un comando o una consulta por el bus y mapean el resultado a un DTO de respuesta. El documento OpenAPI se genera a partir de controladores y DTO.

### Errores

El código de dominio y de aplicación lanza excepciones tipadas. No hay tipos `Result`. Un filtro global mapea las excepciones a respuestas HTTP, y cada contexto registra su propio mapeo de excepción a estado. Añadir un contexto nunca edita `core`.

### Nomenclatura

Los archivos van en kebab-case con un sufijo de rol. Las clases van en PascalCase con el mismo sufijo. Los tokens van en `UPPER_SNAKE`.

| Sufijo | Rol |
| --- | --- |
| `.aggregate` | Raíz de agregado |
| `.value-object` | Value object |
| `.builder` | Builder de agregado |
| `.event` | Evento de dominio |
| `.exception` | Excepción tipada |
| `.primitives` | Forma primitiva de un agregado |
| `.command` / `.query` | Mensaje hacia la capa de aplicación |
| `.handler` | Handler de comando, consulta o evento |
| `.service` | Servicio de aplicación |
| `.port` | Interfaz saliente propiedad de `application` |
| `.adapter` | Implementación de un puerto |
| `.repository` | Interfaz o implementación de repositorio |
| `.mapper` | Mapeo entre representaciones |
| `.schema` | `EntitySchema` de MikroORM |
| `.controller` | Controlador REST |
| `.dto` | Objeto de datos de transporte |
| `.view-model` | Forma de un modelo de lectura |
| `.spec` | Test unitario |

## Frontend

Se aplica a `apps/web` ([D5](/es/adr/d05-frontend-framework/)).

### Estructura

```text
src/
├── contexts/
│   └── search/
│       ├── domain/
│       │   ├── models/
│       │   └── repositories/property-search.repository.port.ts
│       ├── application/
│       │   ├── use-cases/
│       │   │   └── search-properties/
│       │   │       ├── search-properties.use-case.ts
│       │   │       └── search-properties.use-case.spec.ts
│       │   └── query-keys/search.query-keys.ts
│       ├── infrastructure/
│       │   ├── repositories/property-search.http.repository.ts
│       │   └── providers/search.provider.tsx
│       └── presentation/
│           ├── containers/
│           ├── components/
│           ├── hooks/
│           ├── screens/
│           └── stores/
├── shared/
│   ├── domain/ application/ infrastructure/
│   └── presentation/components/{atoms,molecules,organisms,templates}/
└── design-system/
```

### Capas

- Misma regla hacia dentro que en el backend: `presentation` e `infrastructure` dependen de `application`, que depende de `domain`.
- El dominio es un modelo rico construido sobre `@house-radar/building-blocks`, no solo interfaces.
- Los puertos de repositorio viven en `domain`. Los adaptadores de `infrastructure` los implementan sobre el cliente generado desde OpenAPI ([D22](/es/adr/d22-api-style/)); `application` y `presentation` nunca llaman al cliente directamente.
- Los hooks son el único puente de `presentation` a `application`. `application` nunca importa stores.

### Casos de uso

Los casos de uso siempre existen ([D10](/es/adr/d10-cross-cutting-architecture/)). Hay una carpeta por caso de uso, `application/use-cases/<verb-noun>/<verb-noun>.use-case.ts` más su spec, incluso cuando solo delega en un puerto. Una regla sin excepciones se puede imponer con lint; «solo cuando hay lógica» no.

### Raíz de composición

Los adaptadores se inyectan mediante un provider. Un hook recibe su caso de uso del provider; no hay `new UseCase(repository)` a nivel de módulo. Los tests cambian los adaptadores a través del provider y nunca necesitan `vi.mock`.

### Estado según el origen del dato

| Origen | Dónde vive |
| --- | --- |
| Datos del servidor | Solo TanStack Query |
| Estado de cliente compartido | Zustand |
| Estado local de componente | `useState` / `useReducer` |
| Estado de búsqueda | La URL (ver Enrutado) |

Los datos del servidor nunca se replican en un store. Las mutaciones devuelven `{ id }` en lugar de volver a consultar.

### Query keys

Cada contexto tiene una fábrica de query keys en `application/query-keys/`. Los componentes y hooks nunca escriben arrays de claves a mano.

### Enrutado

TanStack Router ([D26](/es/adr/d26-tanstack-router/)). Los parámetros de búsqueda se tipan y validan con zod en la definición de la ruta; los valores inválidos vuelven a los valores por defecto. La navegación es segura a nivel de tipos, de modo que un enlace roto es un error de compilación.

### Internacionalización

`react-i18next` detrás del adaptador de i18n ([D27](/es/adr/d27-react-i18next/), [D12](/es/adr/d12-web-internationalization/)).

- Un namespace por contexto, accedido con `useTranslation`. Sin pasar `dict` por props.
- Las claves se tipan mediante una declaración de recursos de TypeScript, de modo que una clave mal escrita no compila.
- Los idiomas se cargan de forma diferida. Un test verifica la paridad de idiomas por contexto.
- Precios, superficies y fechas se formatean con `Intl.NumberFormat` (`currency: 'EUR'`) e `Intl.DateTimeFormat`, dentro del adaptador.
- Añadir gallego o catalán significa añadir solo archivos de traducción.

### Errores

Un error boundary gestiona los fallos inesperados. Los errores de dominio se mapean a mensajes traducidos en un único lugar.

### Componentes

- Atomic design formal en `shared/presentation/components/{atoms,molecules,organisms,templates}`.
- Dentro de los contextos, una separación explícita: un contenedor obtiene datos y manejadores de los hooks, y un componente de presentación solo renderiza props.
- Una carpeta por componente con `.spec.tsx` y `.stories.tsx` colocados junto a él. Solo exportaciones con nombre.
- Los archivos van en kebab-case con sufijos de rol (`.use-case.ts`, `.repository.port.ts`, `.screen.tsx`, `.hook.ts`, `.store.ts`, `.schema.ts`).
- Stack: Tailwind, shadcn/ui, react-hook-form con zod, Storybook. Los campos de búsqueda llevan debounce.

## Testing

TDD estricto: rojo, verde, refactor ([D14](/es/adr/d14-testing/)). El test va primero y se observa su fallo antes de implementar.

| Tipo | Herramienta | Ubicación y nombre |
| --- | --- | --- |
| Unitario | Vitest | `*.spec.ts` junto al código |
| Componente | Vitest + Testing Library | `*.spec.tsx` junto al componente |
| Integración | Vitest + Testcontainers (Postgres + PostGIS, Redis) | `*.integration-spec.ts` |
| End to end de API | Vitest | `*.e2e-spec.ts` |
| End to end de navegador | Playwright | Solo flujos críticos |

Estilo:

- Un `describe` por clase, un `describe` anidado por método y un `it('should …')` por caso o caso límite.
- Los specs unitarios de dominio y aplicación instancian las clases manualmente con mocks. No usan `@nestjs/testing`.
- Las llamadas a la API en tests de frontend y en Storybook se simulan con MSW.
- Los tests cambian los adaptadores a través de la raíz de composición, nunca con `vi.mock`.

## Herramientas

- **ESLint** (flat config) con `eslint-plugin-boundaries` para las reglas de capas, `@typescript-eslint/no-explicit-any` activado y TypeScript estricto. ESLint también prohíbe las importaciones con `../`.
- **Orden de importaciones** con `eslint-plugin-simple-import-sort`: built-ins, paquetes externos, `@house-radar/*`, alias internos e importaciones relativas del mismo directorio.
- **Prettier** solo formatea: `singleQuote` y `trailingComma: all`.
- **husky + lint-staged** ejecutan ESLint y Prettier sobre los archivos en staging en el pre-commit. La caché de Turborepo mantiene rápida la CI.
- **commitlint** impone Conventional Commits en commit-msg ([D16](/es/adr/d16-quality-and-workflow/)).

## Refinamientos sobre los proyectos de referencia

Estas convenciones parten de proyectos anteriores del autor en NestJS y React y cambian seis cosas:

1. Las reglas que eran solo recomendaciones, como no usar importaciones con `../`, ahora son errores de lint.
2. Los repositorios de escritura son mínimos y los de lectura son de solo lectura.
3. Cada contexto registra su propio mapeo de excepciones; `core` no conoce ningún contexto.
4. Los eventos de dominio tienen consumidores reales: handlers y proyecciones.
5. Los builders solo construyen agregados.
6. El frontend incorpora una raíz de composición, una fábrica de query keys, enrutado y claves de i18n tipados, y casos de uso siempre presentes.

Vitest sustituye a Jest ([D14](/es/adr/d14-testing/)) y los bloques base compartidos son propios ([D24](/es/adr/d24-own-building-blocks/)).
