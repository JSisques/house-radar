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
| Base `AggregateRoot` | Mantiene su propio búfer de eventos: `record(event)`, `peekDomainEvents()` (lee sin vaciar) y `clearDomainEvents()` (lo llama el repositorio de escritura solo tras confirmar la transacción). Expone `version` (bloqueo optimista, [D23](/es/adr/d23-ingestion-concurrency-model/)) e `isNew()` (verdadero hasta el primer guardado); el repositorio de escritura llama a `markPersisted(version)` tras el commit para sincronizar la versión incrementada por la base de datos. La identidad es cualquier value object de identidad. Igualdad tipada y segura ante nulos. |
| Base de value object | `validate()` obligatorio, una excepción tipada por value object, `toPrimitives()`. |
| Value objects genéricos | String, Number, Uuid, Enum, Date y Boolean configurables por opciones. `DateValueObject` rechaza fechas inválidas y copia defensivamente. |
| Eventos de dominio | Envoltorio con `schemaVersion`, `correlationId`, `causationId` y `occurredAt`; `generateEventMetadata()`. |
| Base de builder | `validate()` lanza `FieldIsRequiredException`. Contrato `IBuilderFactory<TBuilder>` para fábricas de builders sin estado. |
| Consultas | `Criteria` inmutable, `PaginatedResult`, `FilterFieldRegistry`. Sin `any` en `Filter.value`. |
| Puertos de repositorio | Puertos de lectura y de escritura separados. |
| `DomainException` | Lleva un `code` y una `cause` opcional. |

Los IDs son UUIDv7, generados con el paquete `uuid` (`v7()`), de modo que el paquete también funciona en el navegador (`apps/web`) ([D32](/es/adr/d32-uuid-v7/)). Aquí nunca se añaden value objects específicos del proyecto.

Los consumidores importan todo desde la raíz del paquete (`@house-radar/building-blocks`); no hay subpaths profundos. Internamente, cada concepto vive en su propia carpeta con su spec y sus excepciones (por ejemplo `domain/value-objects/string/`), y las clases base compartidas quedan en la carpeta padre. Por eso la prohibición de importar con `../` se desactiva dentro de `packages/building-blocks/src`.

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
│       │   │   └── project-listing-price-change/   # comando idempotente de proyección
│       │   └── ports/
│       │       ├── property-gateway.port.ts
│       │       ├── transaction-manager.port.ts
│       │       ├── processed-event-repository.port.ts
│       │       └── property-view-projector.port.ts
│       ├── infrastructure/
│       │   ├── persistence/mikro-orm/{schemas,mappers,repositories}/
│       │   ├── adapters/
│       │   └── messaging/             # relay del outbox, implementaciones de puertos
│       ├── transport/
│       │   ├── messaging/consumers/   # consumidores BullMQ: evento -> comando
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
- Los eventos de dominio los consumen handlers de eventos y proyecciones, por ejemplo el modelo de lectura del precio representativo ([D19](/es/adr/d19-search-read-model/)). El agregado registra eventos con `record()`; los handlers nunca los publican ([D31](/es/adr/d31-transactional-outbox/)):
  - El repositorio de escritura persiste el agregado y sus `peekDomainEvents()` en la tabla `outbox_event` del contexto, en la misma transacción (unit of work de MikroORM), y llama a `clearDomainEvents()` solo tras el commit, de modo que un guardado fallido y su reintento no pierden eventos.
  - Un relay del outbox publica las filas pendientes mediante BullMQ y las marca como publicadas.
  - Un consumidor BullMQ en `transport/messaging/consumers/` convierte el evento en un comando y lo envía por `CommandBus`. El handler del comando es idempotente mediante puertos: `ITransactionManager.run(fn)` e `IProcessedEventRepository.claim(eventId, consumer)` (`INSERT … ON CONFLICT DO NOTHING` sobre `processed_event`), y escribe las proyecciones a través de un puerto de proyector. La infraestructura implementa los puertos con MikroORM.

### Modelo de dominio

- Los agregados se componen de value objects, nunca de primitivos.
- Los agregados se crean mediante builders y lanzan eventos en métodos con nombre (`create()`, `changePrice()`). `toPrimitives()` los serializa.
- Los builders solo construyen agregados. Los view models los construyen mappers y proyecciones.

### Inyección de dependencias

- Repositorios y puertos se enlazan con tokens `Symbol` (`UPPER_SNAKE`) e interfaces con prefijo `I`.
- Los providers del módulo se agrupan en arrays con nombre: `COMMAND_HANDLERS`, `QUERY_HANDLERS`, `APPLICATION_SERVICES`, `DOMAIN_BUILDER_FACTORIES`, `INFRASTRUCTURE_MAPPERS`, `INFRASTRUCTURE_REPOSITORIES`, `INFRASTRUCTURE_ADAPTERS` y `REST_CONTROLLERS`. Los builders tienen estado y nunca son providers: cada agregado tiene una fábrica de builders sin estado (`ListingBuilderFactory`, sin dependencias de framework, en `domain/builders/`), registrada con un token `Symbol` e inyectada en los handlers, que llaman a `create()` en cada ejecución. Se aplica a todos los builders, tengan o no dependencias, de modo que la regla no tiene excepciones y los handlers pueden recibir una fábrica de prueba.
- Los enlaces usan `{ provide, useClass }`. Sin `useExisting`.

```ts
export const LISTING_WRITE_REPOSITORY_TOKEN = Symbol('LISTING_WRITE_REPOSITORY_TOKEN');

export const INFRASTRUCTURE_REPOSITORIES = [
  { provide: LISTING_WRITE_REPOSITORY_TOKEN, useClass: ListingMikroOrmWriteRepository },
];
```

### Persistencia

MikroORM mapeado con `EntitySchema` ([D6](/es/adr/d06-persistence/)), de modo que las clases de dominio no llevan decoradores del ORM. Los schemas, mappers y repositorios viven en `infrastructure/persistence/mikro-orm/`. Los mappers traducen entre entidades del schema y agregados.

Los repositorios de escritura actualizan a través de la entidad gestionada: la cargan con `LockMode.OPTIMISTIC` y `lockVersion` (la `version` del agregado) y después hacen `assign` del nuevo estado. Insertan una entidad nueva solo cuando `isNew()` es verdadero; persistir un objeto nuevo para una fila existente sería un `INSERT`.

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
| `.factory` | Fábrica de builders (sin estado, inyectada) |
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

Se aplica a `apps/web` ([D5](/es/adr/d05-frontend-framework/)). Las reglas visuales (tokens de diseño, tipografía, cómo se dibujan los valores desconocidos) están en [Sistema de diseño](/es/architecture/design-system/) ([D34](/es/adr/d34-visual-direction/)).

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

Ejecución de los specs:

- `pnpm test` ejecuta los specs unitarios y de componente (`*.spec.ts`, `*.spec.tsx`). Nunca recoge los specs de integración ni los e2e.
- `pnpm test:integration` ejecuta solo `*.integration-spec.ts`. Turbo nunca lo cachea, porque el estado de los servicios externos no forma parte del hash de la tarea.
- `*.e2e-spec.ts` es un sufijo reservado. La tarea `test:e2e` llegará con `apps/api`.
- Cada paquete con tests tiene un `vitest.config.ts` (unitarios) y un `vitest.integration.config.ts`. Ambos llaman a `defineKindConfig` del `vitest.shared.ts` de la raíz, que es el único lugar con los globs de los specs y la configuración de cobertura V8.
- El `vitest.config.ts` de la raíz lista los paquetes como `test.projects` para el IDE y las ejecuciones desde la raíz. Las configuraciones de proyecto no deben importarlo.
- Ejecuta `pnpm --filter <paquete> exec vitest run --coverage` para obtener un informe de cobertura (`coverage/`, ignorado por git).
- `packages/vitest-scratch` solo existe para demostrar el descubrimiento de cada tipo de spec. Los paquetes reales no deben depender de él.

Estilo:

- Un `describe` por clase, un `describe` anidado por método y un `it('should …')` por caso o caso límite.
- Los specs unitarios de dominio y aplicación instancian las clases manualmente con mocks. No usan `@nestjs/testing`.
- Las llamadas a la API en tests de frontend y en Storybook se simulan con MSW.
- Los tests cambian los adaptadores a través de la raíz de composición, nunca con `vi.mock`.

## Herramientas

- **Turborepo** ejecuta las tareas del workspace mediante scripts raíz: `pnpm build`, `pnpm dev`, `pnpm lint`, `pnpm test` y `pnpm typecheck` llaman a `turbo run`. `build`, `typecheck` y `test` dependen de `^build`, así que las dependencias se compilan primero, y los resultados se cachean en local. `dev` es persistente y nunca se cachea. Cambiar `tsconfig.base.json` invalida todas las cachés.
- **TypeScript** es estricto por defecto: `tsconfig.base.json` activa `strict` y `noUncheckedIndexedAccess`, y los paquetes lo extienden. `apps/docs` conserva su propia configuración de Astro. `packages/building-blocks` expone sus bloques base desde la raíz del paquete y mantiene el subpath `./package-marker` hasta que lleguen los bloques restantes.
- **Los tests del workspace** comprueban la propia configuración de Turborepo. `pnpm test:workspace` los ejecuta en serie, fuera de `turbo run test`.
- **ESLint** usa una única flat config en la raíz del repositorio, `eslint.config.js`, compartida por todos los workspaces. Cada workspace ejecuta `eslint .` como su script `lint`, y `pnpm lint` los lanza mediante Turborepo. Los archivos de la raíz (`tests/**` y `eslint.config.js`) se lintean con `pnpm lint:root`, fuera de Turborepo, igual que `test:workspace`. El `package.json` raíz declara `"type": "module"` para que la configuración se cargue como ESM. La caché de `lint` depende de `eslint.config.js`, así que editar una regla invalida solo los resultados de lint. Las reglas son:
  - Límites de capas y de contextos con `eslint-plugin-boundaries` (id de regla `boundaries/dependencies`), según la tabla de capas. Solo `infrastructure/adapters` puede llegar a otros contextos.
  - Sin importaciones relativas al directorio padre con `../` (`no-restricted-imports`). Usa un alias o una importación del mismo directorio. Las únicas excepciones son `packages/building-blocks/src` y `packages/shared-kernel/src`, donde las carpetas por concepto importan sus clases base y conceptos hermanos desde la carpeta padre.
  - Sin `any` explícito (`@typescript-eslint/no-explicit-any`), además de TypeScript estricto.
  - Orden de importaciones y exportaciones (ver más abajo).
- **Alias de rutas** `@contexts/*`, `@core/*` y `@shared/*` se declaran una sola vez en `tsconfig.base.json`, con `${configDir}` para que cada proyecto que lo extiende los resuelva contra su propio `src/`. ESLint los resuelve con `eslint-import-resolver-typescript`.
- **Alcance del lint**: los fixtures de `tests/lint-fixtures/` los ignora el lint normal y solo los lintean los tests del workspace. Los archivos `.astro` no se lintean.
- **Orden de importaciones** con `eslint-plugin-simple-import-sort`: built-ins, paquetes externos, `@house-radar/*`, alias internos e importaciones relativas del mismo directorio.
- **Prettier** solo formatea: `singleQuote`, `trailingComma: all` y `printWidth: 120`. `pnpm format` reescribe los archivos y `pnpm format:check` solo los reporta; ambos ejecutan Prettier directamente, fuera de Turborepo, igual que `lint:root`. Prettier omite todo lo de `.gitignore` más `.prettierignore`: `pnpm-lock.yaml`, `openspec/`, `odd/`, `tests/lint-fixtures/`, `apps/docs/design/` (maquetas de referencia de diseño, no código mantenido a mano), `*.md` y `*.mdx`. Por tanto, los documentos Markdown, MDX, OpenSpec y ODD nunca se formatean.
- **Los hooks de git** los instala husky v9 cuando `pnpm install` ejecuta el script raíz `prepare`. Usa `HUSKY=0` o `--no-verify` para saltarlos en una emergencia.
  - `pre-commit` ejecuta `lint-staged` sobre los archivos en staging. Los archivos de código (`js`, `mjs`, `cjs`, `ts`, `tsx`, `mts`, `cts`) ejecutan `eslint --fix` y después `prettier --write`, de modo que Prettier tiene la última palabra sobre el formato. Los archivos `json`, `jsonc`, `yaml`, `yml` y `css` ejecutan `prettier --write`. Un archivo que ESLint no puede corregir aborta el commit.
  - `commit-msg` ejecuta `commitlint` con el preset de Conventional Commits ([D16](/es/adr/d16-quality-and-workflow/)), así que `update stuff` se rechaza y `feat(api): add x` se acepta.
  - `pre-push` ejecuta `pnpm test:changed`, que es `turbo run build test --affected`: compila y prueba los paquetes que han cambiado desde `main`. Cambia la base con `TURBO_SCM_BASE=<ref> pnpm test:changed`. Si la referencia base no se puede resolver, por ejemplo cuando no hay `main` local, turbo falla y el push también, así que define `TURBO_SCM_BASE` o salta el hook. `pnpm test:workspace` no forma parte de los hooks; lo ejecuta la CI.
- **CI** es `.github/workflows/ci.yml`. Se ejecuta en cada pull request y en cada push a `main`, sin filtro de rutas, así que sus checks siempre se reportan. Los dos jobs instalan con la caché de pnpm y `--frozen-lockfile`, y descargan el historial completo porque turbo y commitlint comparan contra una base.
  - `code` ejecuta `pnpm format:check`, `pnpm lint:root`, `pnpm test:workspace` y después `turbo run lint typecheck test build --filter="...[<base>]"`. La base es `origin/<rama destino>` en un pull request y el commit anterior de `main` en un push, así que solo se ejecutan los workspaces afectados y sus dependientes. Un pull request que solo toca `apps/docs` ejecuta las tareas de docs y nada más.
  - `commits` se ejecuta solo en pull requests. Ejecuta `commitlint` sobre los commits del pull request (de la base al head), así que un commit como `update stuff` hace fallar el check. Las reglas de ignorado por defecto de commitlint omiten los commits de merge.
  - Los **checks requeridos** para `main` son `code` y `commits`. No exijas el job `verify` de `docs.yml`: ese workflow tiene filtro de rutas, no se ejecuta en todos los pull requests y un check requerido que nunca se reporta bloquea el merge.
- **Renovate** abre las actualizaciones de dependencias, configurado en `renovate.json` en la raíz. Extiende `config:recommended` y usa `rangeStrategy: pin`, así que las versiones nuevas se mantienen fijadas de forma exacta y `pnpm-lock.yaml` se actualiza en el mismo pull request. Los commits son `chore(deps): ...`, así que pasan commitlint. Actualiza las dependencias npm, `packageManager`, `engines` (un rango solo se edita cuando deja de encajar, nunca se fija) y las GitHub Actions. Los paquetes que se publican juntos llegan en un único pull request agrupado: `typescript-eslint`, `@commitlint/*`, y Astro con Starlight. Las actualizaciones se ejecutan cada semana (lunes, antes de las 6:00, `Europe/Madrid`), con una issue de dashboard de dependencias y mantenimiento semanal del lockfile. Las actualizaciones minor, patch, pin y digest (y el mantenimiento del lockfile) se fusionan solas cuando pasan los checks requeridos; las major y las versiones `0.x` siempre esperan revisión manual. El automerge solo es seguro con los checks `code` y `commits` requeridos en `main`. El mantenedor instala la GitHub App de Renovate. `pnpm test:workspace` valida el archivo con `renovate-config-validator --strict`, así que una configuración inválida hace fallar los tests.
- **Los finales de línea** se normalizan a LF: `.gitattributes` con `text=auto eol=lf` y un `.editorconfig` con `end_of_line = lf`. Los scripts solo de Windows (`.bat`, `.cmd`) mantienen CRLF. Los archivos Markdown desactivan el recorte de espacios finales.

## Refinamientos sobre los proyectos de referencia

Estas convenciones parten de proyectos anteriores del autor en NestJS y React y cambian seis cosas:

1. Las reglas que eran solo recomendaciones, como no usar importaciones con `../`, ahora son errores de lint.
2. Los repositorios de escritura son mínimos y los de lectura son de solo lectura.
3. Cada contexto registra su propio mapeo de excepciones; `core` no conoce ningún contexto.
4. Los eventos de dominio tienen consumidores reales: handlers y proyecciones.
5. Los builders solo construyen agregados.
6. El frontend incorpora una raíz de composición, una fábrica de query keys, enrutado y claves de i18n tipados, y casos de uso siempre presentes.

Vitest sustituye a Jest ([D14](/es/adr/d14-testing/)) y los bloques base compartidos son propios ([D24](/es/adr/d24-own-building-blocks/)).
