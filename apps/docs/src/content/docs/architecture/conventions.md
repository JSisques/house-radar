---
title: Code conventions
description: Structure, layering, naming, testing and tooling rules for the backend, the frontend and the shared packages.
sidebar:
  order: 3
---

These conventions apply to `apps/api`, `apps/ingestion`, `apps/web`, `packages/building-blocks` and `packages/shared-kernel`. They refine the decisions [D4](/adr/d04-backend-framework/), [D5](/adr/d05-frontend-framework/), [D10](/adr/d10-cross-cutting-architecture/), [D14](/adr/d14-testing/) and [D16](/adr/d16-quality-and-workflow/), and are recorded in [D24](/adr/d24-own-building-blocks/), [D25](/adr/d25-cqrs-and-context-structure/), [D26](/adr/d26-tanstack-router/) and [D27](/adr/d27-react-i18next/).

## Principles

- **Dependencies point inward.** `transport` and `infrastructure` depend on `application`, and `application` depends on `domain`. Never the other way around.
- **The domain is framework-free.** No NestJS, MikroORM, `@nestjs/cqrs` or React in `domain`. Decorators and dependency injection live in the outer layers ([D4](/adr/d04-backend-framework/), [D10](/adr/d10-cross-cutting-architecture/)).
- **Rules are enforced by lint, not by review.** Layer boundaries, import paths and ordering are ESLint rules. A rule that cannot be enforced automatically is a rule that erodes.
- **No barrel files.** Import from the file that defines the symbol.
- **One type per file.** The only exception is `{Name}CommandInput` / `{Name}QueryInput`, declared in the command or query file.
- **Path aliases.** Cross-directory imports use aliases (`@contexts/*`, `@core/*`, `@shared/*`). Relative imports are allowed only inside the same directory.

## Monorepo packages

Both packages are framework-free TypeScript in strict mode.

### `packages/building-blocks` (`@house-radar/building-blocks`)

Generic DDD building blocks with no House Radar concepts.

| Contents | Rule |
| --- | --- |
| `AggregateRoot` base | Keeps its own event buffer: `record(event)` and `pullDomainEvents()`. Identity is any identity value object. Typed, null-safe equality. |
| Value object base | Mandatory `validate()`, one typed exception per value object, `toPrimitives()`. |
| Generic value objects | Option-configured String, Number, Uuid, Enum, Date and Boolean. `DateValueObject` rejects invalid dates and copies defensively. |
| Domain events | Envelope with `schemaVersion`, `correlationId`, `causationId` and `occurredAt`; `generateEventMetadata()`. |
| Builder base | `validate()` throws `FieldIsRequiredException`. `IBuilderFactory<TBuilder>` contract for stateless builder factories. |
| Querying | Immutable `Criteria`, `PaginatedResult`, `FilterFieldRegistry`. No `any` in `Filter.value`. |
| Repository ports | Separate read and write ports. |
| `DomainException` | Carries a `code` and an optional `cause`. |

UUIDs are generated with `globalThis.crypto.randomUUID()`, so the package also works in the browser (`apps/web`). Project-specific value objects are never added here.

### `packages/shared-kernel` (`@house-radar/shared-kernel`)

House Radar concepts used by two or more contexts. Depends on `building-blocks`.

- `Money` (EUR, integer cents), `Area` (m²), `PricePerSquareMeter`.
- `GeoPoint`, `LocationPrecision` ([D18](/adr/d18-location-pin-declared-precision/)), `MunicipalityCode`.
- Closed catalogs: `PropertyType`, `PropertyCondition`, `EnergyCertificate`.
- Provenance: `SourceId`, `ExternalId`, `ListingUrl` (normalization from [D17](/adr/d17-manual-import-assisted-form/)).
- Cross-context identities: `PropertyId`, `ListingId`. Aggregates reference each other by identity only.
- `Known<T> | Unknown`, with the data origin (declared, calculated or inferred).

A value object starts inside its context and moves to `shared-kernel` only when a second context needs it. Concrete aggregates, commands, queries, DTOs and ORM mappings never go in either package.

`apps/api` and `apps/ingestion` use both packages. `apps/web` uses `building-blocks` for its own domain, and `shared-kernel` only where a value object fits as is.

## Backend

Applies to `apps/api` and `apps/ingestion`.

### Structure

Screaming architecture by bounded context. Example for the `listings` context:

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
├── core/      # app-wide infrastructure: config, filters, health, observability
└── shared/    # cross-context Nest pieces
```

### Layers

| Layer | Holds | May import |
| --- | --- | --- |
| `domain` | Aggregates, value objects, builders, events, domain exceptions, repository interfaces | `@house-radar/building-blocks`, `@house-radar/shared-kernel` |
| `application` | Commands, queries, handlers, services, ports, event handlers | `domain` |
| `infrastructure` | Persistence, adapters, messaging, anything outbound | `application`, `domain` |
| `transport` | Everything inbound: REST controllers, DTOs, mappers, exception mapping | `application` (buses), `domain` types |

Cross-context communication goes only through a port in `application/ports/*.port.ts`, implemented by an adapter in `infrastructure/adapters/`. That directory is the only place allowed to import another context. The alternative is domain events.

### CQRS

CQRS with `@nestjs/cqrs` ([D25](/adr/d25-cqrs-and-context-structure/)).

- Every command and query has its own folder named after it, holding the message, its handler and its spec.
- A command changes state and returns at most `{ id }`. A query reads and never changes state.
- Handlers go through repositories and services. Transport goes only through `CommandBus` and `QueryBus`.
- Services are split into `services/write/` and `services/read/`.
- Write repositories expose only `save`, `findById` and `delete`. Read repositories are read-only (`findById`, `findByCriteria`).
- Domain events are consumed by event handlers and projections, for example the representative price read model ([D19](/adr/d19-search-read-model/)). The aggregate records events with `record()`; the command handler publishes `pullDomainEvents()` to the `EventBus`.

### Domain model

- Aggregates are composed of value objects, never raw primitives.
- Aggregates are created through builders and raise events in named methods (`create()`, `changePrice()`). `toPrimitives()` serializes them.
- Builders build aggregates only. View models are built by mappers and projections.

### Dependency injection

- Repositories and ports are bound with `Symbol` tokens (`UPPER_SNAKE`) and `I`-prefixed interfaces.
- Module providers are grouped in named arrays: `COMMAND_HANDLERS`, `QUERY_HANDLERS`, `APPLICATION_SERVICES`, `DOMAIN_BUILDER_FACTORIES`, `INFRASTRUCTURE_MAPPERS`, `INFRASTRUCTURE_REPOSITORIES`, `INFRASTRUCTURE_ADAPTERS` and `REST_CONTROLLERS`. Builders are stateful and never providers: each aggregate has a stateless builder factory (`ListingBuilderFactory`, framework-free, in `domain/builders/`), bound with a `Symbol` token and injected into handlers, which call `create()` on every execution. This applies to every builder, with or without dependencies, so the rule has no exceptions and handlers can receive a test factory.
- Bindings use `{ provide, useClass }`. No `useExisting`.

```ts
export const LISTING_WRITE_REPOSITORY_TOKEN = Symbol('LISTING_WRITE_REPOSITORY_TOKEN');

export const INFRASTRUCTURE_REPOSITORIES = [
  { provide: LISTING_WRITE_REPOSITORY_TOKEN, useClass: ListingMikroOrmWriteRepository },
];
```

### Persistence

MikroORM mapped with `EntitySchema` ([D6](/adr/d06-persistence/)), so domain classes carry no ORM decorators. Schemas, mappers and repositories live in `infrastructure/persistence/mikro-orm/`. Mappers translate between schema entities and aggregates.

### Transport

REST only ([D22](/adr/d22-api-style/)): no GraphQL and no MCP. Controllers validate input with DTOs, send a command or query through the bus, and map the result to a response DTO. The OpenAPI document is generated from controllers and DTOs.

### Errors

Domain and application code throws typed exceptions. There are no `Result` types. A global filter maps exceptions to HTTP responses, and each context registers its own exception-to-status mapping. Adding a context never edits `core`.

### Naming

Files are kebab-case with a role suffix. Classes are PascalCase with the same suffix. Tokens are `UPPER_SNAKE`.

| Suffix | Role |
| --- | --- |
| `.aggregate` | Aggregate root |
| `.value-object` | Value object |
| `.builder` | Aggregate builder |
| `.factory` | Builder factory (stateless, injected) |
| `.event` | Domain event |
| `.exception` | Typed exception |
| `.primitives` | Primitive shape of an aggregate |
| `.command` / `.query` | Message to the application layer |
| `.handler` | Command, query or event handler |
| `.service` | Application service |
| `.port` | Outbound interface owned by `application` |
| `.adapter` | Implementation of a port |
| `.repository` | Repository interface or implementation |
| `.mapper` | Mapping between representations |
| `.schema` | MikroORM `EntitySchema` |
| `.controller` | REST controller |
| `.dto` | Transport data object |
| `.view-model` | Read model shape |
| `.spec` | Unit test |

## Frontend

Applies to `apps/web` ([D5](/adr/d05-frontend-framework/)).

### Structure

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

### Layers

- Same inward rule as the backend: `presentation` and `infrastructure` depend on `application`, which depends on `domain`.
- The domain is a rich model built on `@house-radar/building-blocks`, not interfaces only.
- Repository ports live in `domain`. Adapters in `infrastructure` implement them over the OpenAPI-generated client ([D22](/adr/d22-api-style/)), never calling the client from `application` or `presentation` directly.
- Hooks are the only bridge from `presentation` to `application`. `application` never imports stores.

### Use cases

Use cases are always present ([D10](/adr/d10-cross-cutting-architecture/)). There is one folder per use case, `application/use-cases/<verb-noun>/<verb-noun>.use-case.ts` plus its spec, even when it only delegates to a port. A rule without exceptions can be enforced by lint, while "only when there is logic" cannot.

### Composition root

Adapters are injected through a provider. A hook receives its use case from the provider; there is no module-scope `new UseCase(repository)`. Tests swap adapters through the provider and never need `vi.mock`.

### State by data origin

| Origin | Where it lives |
| --- | --- |
| Server data | TanStack Query only |
| Shared client state | Zustand |
| Local component state | `useState` / `useReducer` |
| Search state | The URL (see Routing) |

Server data is never mirrored into a store. Mutations return `{ id }` instead of re-fetching.

### Query keys

Each context has a query key factory in `application/query-keys/`. Components and hooks never write key arrays by hand.

### Routing

TanStack Router ([D26](/adr/d26-tanstack-router/)). Search params are typed and validated with zod in the route definition; invalid values fall back to defaults. Navigation is type-safe, so a broken link is a compile error.

### Internationalization

`react-i18next` behind the i18n adapter ([D27](/adr/d27-react-i18next/), [D12](/adr/d12-web-internationalization/)).

- One namespace per context, accessed with `useTranslation`. No `dict` prop drilling.
- Keys are typed through a TypeScript resource declaration, so a misspelled key does not compile.
- Locales load lazily. A test verifies locale parity per context.
- Prices, areas and dates are formatted with `Intl.NumberFormat` (`currency: 'EUR'`) and `Intl.DateTimeFormat`, inside the adapter.
- Adding Galician or Catalan means adding translation files only.

### Errors

An error boundary handles unexpected failures. Domain errors are mapped to translated messages in one place.

### Components

- Formal atomic design in `shared/presentation/components/{atoms,molecules,organisms,templates}`.
- Inside contexts, an explicit split: a container gets data and handlers from hooks, a presentational component only renders props.
- One folder per component with a colocated `.spec.tsx` and `.stories.tsx`. Named exports only.
- Files are kebab-case with role suffixes (`.use-case.ts`, `.repository.port.ts`, `.screen.tsx`, `.hook.ts`, `.store.ts`, `.schema.ts`).
- Stack: Tailwind, shadcn/ui, react-hook-form with zod, Storybook. Search inputs are debounced.

## Testing

Strict TDD: red, green, refactor ([D14](/adr/d14-testing/)). The test comes first and its failure is observed before the implementation.

| Kind | Tool | Location and name |
| --- | --- | --- |
| Unit | Vitest | `*.spec.ts` next to the code |
| Component | Vitest + Testing Library | `*.spec.tsx` next to the component |
| Integration | Vitest + Testcontainers (Postgres + PostGIS, Redis) | `*.integration-spec.ts` |
| API end to end | Vitest | `*.e2e-spec.ts` |
| Browser end to end | Playwright | Critical flows only |

Style:

- One `describe` per class, a nested `describe` per method, and one `it('should …')` per case or edge case.
- Domain and application unit specs instantiate classes manually with mocks. They do not use `@nestjs/testing`.
- API calls in frontend tests and Storybook are mocked with MSW.
- Tests swap adapters through the composition root, never with `vi.mock`.

## Tooling

- **ESLint** (flat config) with `eslint-plugin-boundaries` for layer rules, `@typescript-eslint/no-explicit-any` enabled and strict TypeScript. ESLint also forbids `../` imports.
- **Import order** with `eslint-plugin-simple-import-sort`: built-ins, external packages, `@house-radar/*`, internal aliases, same-directory relative imports.
- **Prettier** formats only: `singleQuote` and `trailingComma: all`.
- **husky + lint-staged** run ESLint and Prettier on staged files at pre-commit. Turborepo caching keeps CI fast.
- **commitlint** enforces Conventional Commits on commit-msg ([D16](/adr/d16-quality-and-workflow/)).

## Refinements over the reference projects

These conventions start from the author's earlier NestJS and React projects and change six things:

1. Rules that were only guidelines, such as no `../` imports, are now lint errors.
2. Write repositories are minimal and read repositories are read-only.
3. Each context registers its own exception mapping; `core` knows no context.
4. Domain events have real consumers: handlers and projections.
5. Builders build aggregates only.
6. The frontend gets a composition root, a query key factory, typed routing and i18n keys, and always-present use cases.

Vitest replaces Jest ([D14](/adr/d14-testing/)), and the shared building blocks are our own ([D24](/adr/d24-own-building-blocks/)).
