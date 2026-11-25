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
- **One concept per folder.** Every concept lives in a folder named after it, holding its files and its spec (`exceptions/exception-mapping/exception-mapping.registry.ts` next to `exception-mapping.registry.spec.ts` in the backend, `router/app-router/app-router.tsx` next to `app-router.spec.tsx` in the web app), as commands, queries and domain concepts already do.
- **One type per file.** The only exception is `{Name}CommandInput` / `{Name}QueryInput`, declared in the command or query file.
- **Path aliases.** Cross-directory imports use aliases (`@contexts/*`, `@core/*`, `@shared/*`). Relative imports are allowed only inside the same directory.

## Monorepo packages

Both packages are framework-free TypeScript in strict mode.

### `packages/building-blocks` (`@house-radar/building-blocks`)

Generic DDD building blocks with no House Radar concepts.

| Contents | Rule |
| --- | --- |
| `AggregateRoot` base | Keeps its own event buffer: `record(event)`, `peekDomainEvents()` (reads without draining) and `clearDomainEvents()` (called by the write repository only after the transaction commits). Exposes `version` (optimistic locking, [D23](/adr/d23-ingestion-concurrency-model/)) and `isNew()` (true until the first save); `markPersisted(version)` is called by the write repository after commit to sync the version bumped by the database. Identity is any identity value object. Typed, null-safe equality. |
| Value object base | Mandatory `validate()`, one typed exception per value object, `toPrimitives()`. |
| Generic value objects | Option-configured String, Number, Uuid, Enum, Date and Boolean. `DateValueObject` rejects invalid dates and copies defensively. |
| Domain events | Envelope with `schemaVersion`, `correlationId`, `causationId` and `occurredAt`; `generateEventMetadata()`. |
| Builder base | `validate()` throws `FieldIsRequiredException`. `IBuilderFactory<TBuilder>` contract for stateless builder factories. |
| Querying | Immutable `Criteria`, `PaginatedResult`, `FilterFieldRegistry`. No `any` in `Filter.value`. |
| Repository ports | Separate read and write ports. |
| `DomainException` | Carries a `code` and an optional `cause`. |

IDs are UUIDv7, generated with the `uuid` package (`v7()`), so the package also works in the browser (`apps/web`) ([D32](/adr/d32-uuid-v7/)). Project-specific value objects are never added here.

Consumers import everything from the package root (`@house-radar/building-blocks`); there are no deep subpaths. Internally, each concept lives in its own folder with its spec and exceptions (for example `domain/value-objects/string/`), and shared base classes stay in the parent folder. For that reason the `../` import ban is turned off inside `packages/building-blocks/src`.

### `packages/shared-kernel` (`@house-radar/shared-kernel`)

House Radar concepts used by two or more contexts. Depends on `building-blocks`.

- `Money` (EUR, integer cents), `Area` (m²), `PricePerSquareMeter`.
- `GeoPoint`, `LocationPrecision` ([D18](/adr/d18-location-pin-declared-precision/)), `MunicipalityCode`.
- Closed catalogs: `PropertyType`, `PropertyCondition`, `EnergyCertificate`.
- Provenance: `SourceId`, `ExternalId`, `ListingUrl` (normalization from [D17](/adr/d17-manual-import-assisted-form/)).
- Cross-context identities: `PropertyId`, `ListingId`. Aggregates reference each other by identity only.
- `Known<T> | Unknown` (`Maybe<T>`), with the data origin (declared, calculated or inferred). An aggregate field that the source may not state is typed `Maybe<T>` and defaults to `UNKNOWN`, never to `0`, an empty string or `null`, because a missing datum does not mean the feature is absent (HR-F002-BR4). In `toPrimitives()` it is serialized as `MaybePrimitives<T>` (`{ kind: 'known', value, origin }` or `{ kind: 'unknown' }`) with `maybeToPrimitives()`, so events and persistence keep the origin.

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
│       │   ├── interfaces/listing-props.interface.ts
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
│       │   │   └── project-listing-price-change/   # idempotent projection command
│       │   └── ports/
│       │       ├── property-gateway.port.ts
│       │       ├── transaction-manager.port.ts
│       │       ├── processed-event-repository.port.ts
│       │       └── property-view-projector.port.ts
│       ├── infrastructure/
│       │   ├── persistence/mikro-orm/{schemas,mappers,repositories}/
│       │   ├── adapters/
│       │   └── messaging/             # outbox relay, port implementations
│       ├── transport/
│       │   ├── messaging/consumers/   # BullMQ consumers: event -> command
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
- Commands carry primitives, not value objects, and every field the user must supply is typed as optional. The handler calls an injected assert service (for example `AssertManualListingInputService`) that checks presence, collects every missing field and throws one typed exception, so a request missing several fields reports all of them. The handler then builds value objects from the asserted primitives; their domain exceptions are mapped to 400 at the transport layer. DTOs only check shape and types.
- Services are split into `services/write/` and `services/read/`.
- Write repositories expose only `save`, `findById` and `delete`. Read repositories are read-only (`findById`, `findByCriteria`).
- Domain events are consumed by event handlers and projections, for example the representative price read model ([D19](/adr/d19-search-read-model/)). The aggregate records events with `record()`; handlers never publish them ([D31](/adr/d31-transactional-outbox/)):
  - The write repository persists the aggregate and its `peekDomainEvents()` into the context's `outbox_event` table in the same transaction (MikroORM unit of work), and calls `clearDomainEvents()` only after the commit, so a failed save and its retry do not lose events.
  - `save()` is the transaction boundary of a write command. If it runs inside an outer `ITransactionManager.run(fn)`, it joins that transaction and the buffer is cleared when `save()` returns, before the outer commit. If the outer transaction then rolls back, the in-memory aggregate has lost its events, so discard it and reload instead of retrying `save()` on it. Idempotent consumers (`claim` + projector writes) use `run(fn)` and do not save aggregates, so they are not affected.
  - An outbox relay publishes pending rows through BullMQ and marks them as published.
  - A BullMQ consumer in `transport/messaging/consumers/` maps the event to a command and sends it through `CommandBus`. The command handler is idempotent through ports: `ITransactionManager.run(fn)` and `IProcessedEventRepository.claim(eventId, consumer)` (`INSERT … ON CONFLICT DO NOTHING` on `processed_event`), and it writes projections through a projector port. Infrastructure implements the ports with MikroORM.

### Domain model

- Aggregates are composed of value objects, never raw primitives.
- `AggregateRoot` carries no `createdAt` or `updatedAt`. The technical `created_at` and `updated_at` columns are filled by the infrastructure (the MikroORM schema, `onCreate` and `onUpdate`) and never appear in the aggregate or its primitives. A date that is business data (for example a listing's `addedAt` or `lastCheckedAt`) is modelled by the aggregate as its own value object.
- Interfaces of the domain (such as the `IListingProps` an aggregate constructor takes) live in `domain/interfaces/`, one per file, never inside the aggregate or value object file. Primitive shapes stay in `domain/primitives/`.
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

MikroORM mapped with `defineEntity` schemas ([D6](/adr/d06-persistence/), [D38](/adr/d38-persistence-row-definition/)), so domain classes carry no ORM decorators. The row type is `InferEntity<typeof Schema>`; there is no hand-written row interface. Schemas, mappers and repositories live in `infrastructure/persistence/mikro-orm/`. Mappers translate between schema entities and aggregates. Decimal columns need `.columnType('numeric')` (the default is `numeric(10,0)`), nullable columns use `.strictNullable()` so the type stays `T | null`, and `toRow` omits `version`, `createdAt` and `updatedAt`.

Write repositories update through the managed entity: load it with `LockMode.OPTIMISTIC` and `lockVersion` (the aggregate's `version`), then `assign` the new state. They insert a new entity only when `isNew()` is true; persisting a fresh object for an existing row would be an `INSERT`.

### Transport

REST only ([D22](/adr/d22-api-style/)): no GraphQL and no MCP. Controllers validate input with DTOs, send a command or query through the bus, and map the result to a response DTO. The OpenAPI document is generated from controllers and DTOs.

### Errors

Domain and application code throws typed exceptions. There are no `Result` types. A global filter maps exceptions to HTTP responses, and each context registers its own exception-to-status mapping. Adding a context never edits `core`. In `apps/api`, a context registers `{ exception, status, code }` mappings with `ExceptionMappingRegistry` in its module's `onModuleInit`; responses have the shape `{ statusCode, code, message }`, and unmapped errors answer `500 INTERNAL_ERROR`.

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
| `.interface` | Contract of the domain that is not an aggregate shape (for example the props an aggregate constructor takes) |
| `.command` / `.query` | Message to the application layer |
| `.handler` | Command, query or event handler |
| `.service` | Application service |
| `.port` | Outbound interface owned by `application` |
| `.adapter` | Implementation of a port |
| `.repository` | Repository interface or implementation |
| `.mapper` | Mapping between representations |
| `.schema` | MikroORM `defineEntity` schema |
| `.controller` | REST controller |
| `.dto` | Transport data object |
| `.view-model` | Read model shape |
| `.spec` | Unit test |

## Frontend

Applies to `apps/web` ([D5](/adr/d05-frontend-framework/)). Visual rules (design tokens, typography, how unknown values are drawn) are in [Design system](/architecture/design-system/) ([D34](/adr/d34-visual-direction/)).

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

- One namespace per context. Components read texts and formats through `useI18n()`, which returns the `I18nPort` from the composition root, not `useTranslation` directly; the react-i18next adapter is the only code that touches the library. This lets a test inject a fake port without an `I18nextProvider`. No `dict` prop drilling.
- Keys are typed through a TypeScript resource declaration, so a misspelled key does not compile.
- Locales load lazily. A test verifies locale parity per context.
- Prices, areas and dates are formatted with `Intl.NumberFormat` (`currency: 'EUR'`) and `Intl.DateTimeFormat`, inside the adapter.
- Adding Galician or Catalan means adding translation files only.

### Errors

An error boundary handles unexpected failures. Domain errors are mapped to translated messages in one place.

### Components

- Formal atomic design in `shared/presentation/components/{atoms,molecules,organisms,templates}`.
- Inside contexts, an explicit split: a container gets data and handlers from hooks, a presentational component only renders props.
- Containers live in `contexts/<context>/presentation/containers`, presentational components in `contexts/<context>/presentation/components`. ESLint boundaries reject a presentational component importing a container, and each atomic level may only import levels below it.
- MSW handlers live in `shared/infrastructure/testing/msw`: the node server runs in every Vitest spec and fails on unhandled requests; the same handlers feed Storybook through `msw-storybook-addon`.
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

Running specs:

- `pnpm test` runs unit and component specs (`*.spec.ts`, `*.spec.tsx`). Integration and e2e specs are never picked up by it.
- `pnpm test:integration` runs only `*.integration-spec.ts`. Turbo never caches it, because the state of external services is not part of the task hash.
- `*.e2e-spec.ts` is a reserved suffix. The `test:e2e` task arrives with `apps/api`.
- Each package that has tests owns a `vitest.config.ts` (unit) and a `vitest.integration.config.ts`. Both call `defineKindConfig` from the root `vitest.shared.ts`, which is the single place for the spec globs and the V8 coverage settings.
- The root `vitest.config.ts` lists the packages as `test.projects` for IDE and root-level runs. Project configs must not import it.
- Run `pnpm --filter <package> exec vitest run --coverage` for a coverage report (`coverage/`, ignored by git).
- `packages/vitest-scratch` only exists to prove discovery for each spec kind. Real packages must not depend on it.

Integration specs get their containers from `@house-radar/testing`: `startPostgres()` (PostGIS, same image as `compose.yaml`) and `startRedis()`, each call a fresh throwaway container so parallel suites share no state, plus `resetSchema()` to wipe a database between cases. Run them with `pnpm test:integration`, which needs Docker and aborts with an explicit message when it is missing. Add `@house-radar/testing/global-setup` as the Vitest `globalSetup` to fail fast.

Style:

- One `describe` per class, a nested `describe` per method, and one `it('should …')` per case or edge case.
- Domain and application unit specs instantiate classes manually with mocks. They do not use `@nestjs/testing`.
- API calls in frontend tests and Storybook are mocked with MSW.
- Tests swap adapters through the composition root, never with `vi.mock`.

## Tooling

- **Turborepo** runs the workspace tasks through root scripts: `pnpm build`, `pnpm dev`, `pnpm lint`, `pnpm test` and `pnpm typecheck` all call `turbo run`. `build`, `typecheck` and `test` depend on `^build`, so dependencies build first, and results are cached locally. `dev` is persistent and never cached. Changing `tsconfig.base.json` invalidates every cache.
- **TypeScript** is strict by default: `tsconfig.base.json` enables `strict` and `noUncheckedIndexedAccess`, and packages extend it. `apps/docs` keeps its own Astro config. `packages/building-blocks` exposes its building blocks from the package root and keeps the `./package-marker` subpath until the remaining blocks arrive.
- **Workspace tests** check the Turborepo wiring itself. `pnpm test:workspace` runs them serially, outside `turbo run test`.
- **ESLint** uses one flat config at the repository root, `eslint.config.js`, shared by every workspace. Each workspace runs `eslint .` as its `lint` script, and `pnpm lint` runs them through Turborepo. Root files (`tests/**` and `eslint.config.js`) are linted by `pnpm lint:root`, outside Turborepo, like `test:workspace`. The root `package.json` sets `"type": "module"` so the config loads as ESM. The `lint` cache keys on `eslint.config.js`, so editing a rule invalidates only lint results. The rules are:
  - Layer and context boundaries from `eslint-plugin-boundaries` (rule id `boundaries/dependencies`), following the Layers table. Only `infrastructure/adapters` may reach into other contexts.
  - No parent-relative `../` imports (`no-restricted-imports`). Use an alias or a same-directory import. The only exceptions are `packages/building-blocks/src` and `packages/shared-kernel/src`, where per-concept folders import their base classes and sibling concepts from the parent folder.
  - No explicit `any` (`@typescript-eslint/no-explicit-any`) on top of the strict TypeScript setup.
  - Import and export order (see below).
- **Path aliases** `@contexts/*`, `@core/*` and `@shared/*` are declared once in `tsconfig.base.json`, using `${configDir}` so each extending project resolves them against its own `src/`. ESLint resolves them through `eslint-import-resolver-typescript`.
- **Lint scope**: the lint fixtures under `tests/lint-fixtures/` are ignored by normal lint and linted only by the workspace tests. `.astro` files are not linted.
- **Import order** with `eslint-plugin-simple-import-sort`: built-ins, external packages, `@house-radar/*`, internal aliases, same-directory relative imports.
- **Prettier** formats only: `singleQuote`, `trailingComma: all` and `printWidth: 120`. `pnpm format` rewrites files and `pnpm format:check` only reports them; both run Prettier directly, outside Turborepo, like `lint:root`. Prettier skips everything in `.gitignore` plus `.prettierignore`: `pnpm-lock.yaml`, `openspec/`, `odd/`, `tests/lint-fixtures/`, `apps/docs/design/` (design reference mockups, not hand-maintained code), `*.md` and `*.mdx`. So Markdown, MDX, OpenSpec and ODD documents are never formatted.
- **Git hooks** are installed by husky v9 when `pnpm install` runs the root `prepare` script. Set `HUSKY=0` or use `--no-verify` to bypass them in an emergency.
  - `pre-commit` runs `lint-staged` on staged files. Code files (`js`, `mjs`, `cjs`, `ts`, `tsx`, `mts`, `cts`) run `eslint --fix` and then `prettier --write`, so Prettier has the final say on layout. `json`, `jsonc`, `yaml`, `yml` and `css` files run `prettier --write`. A file that ESLint cannot fix aborts the commit.
  - `commit-msg` runs `commitlint` with the Conventional Commits preset ([D16](/adr/d16-quality-and-workflow/)), so `update stuff` is rejected and `feat(api): add x` is accepted.
  - `pre-push` runs `pnpm test:changed`, which is `turbo run build test --affected`: it builds and tests the packages changed since `main`. Override the base with `TURBO_SCM_BASE=<ref> pnpm test:changed`. If the base ref cannot be resolved, for example when there is no local `main`, turbo fails and so does the push, so set `TURBO_SCM_BASE` or bypass the hook. `pnpm test:workspace` is not part of the hooks; CI runs it.
- **CI** is `.github/workflows/ci.yml`. It runs on every pull request and on every push to `main`, with no path filter, so its checks always report. Both jobs install with the pnpm cache and `--frozen-lockfile`, and check out the full history because turbo and commitlint compare against a base.
  - `code` runs `pnpm format:check`, `pnpm lint:root`, `pnpm test:workspace` and then `turbo run lint typecheck test build --filter="...[<base>]"`. The base is `origin/<target branch>` on a pull request and the previous tip of `main` on a push, so only the affected workspaces and their dependents run. A pull request that touches only `apps/docs` runs the docs tasks and nothing else.
  - `commits` runs only on pull requests. It runs `commitlint` over the commits of the pull request (base to head), so a commit such as `update stuff` fails the check. Merge commits are skipped by commitlint's default ignore rules.
  - The **required checks** for `main` are `code` and `commits`. Do not require the `verify` job of `docs.yml`: that workflow has a path filter, so it does not run on every pull request and a required check that never reports blocks the merge.
- **Renovate** opens the dependency updates, configured in `renovate.json` at the root. It extends `config:recommended` and uses `rangeStrategy: pin`, so new versions stay exact-pinned and `pnpm-lock.yaml` is updated in the same pull request. Commits are `chore(deps): ...`, so they pass commitlint. It updates npm dependencies, `packageManager`, `engines` (a range is only edited when it no longer fits, never pinned) and GitHub Actions. Packages released together land in one grouped pull request: `typescript-eslint`, `@commitlint/*`, and Astro with Starlight. Updates run weekly (Monday, before 6am, `Europe/Madrid`), with a dependency dashboard issue and weekly lockfile maintenance. Minor, patch, pin and digest updates (and lockfile maintenance) automerge once the required checks pass; major updates and `0.x` versions always wait for a manual review. Automerge only works with the `code` and `commits` checks required on `main`. The maintainer installs the Renovate GitHub App. `pnpm test:workspace` validates the file with `renovate-config-validator --strict`, so an invalid config fails the tests.
- **Line endings** are normalized to LF: `.gitattributes` with `text=auto eol=lf` and an `.editorconfig` with `end_of_line = lf`. Windows-only scripts (`.bat`, `.cmd`) keep CRLF. Markdown files disable trailing-whitespace trimming.

## Refinements over the reference projects

These conventions start from the author's earlier NestJS and React projects and change six things:

1. Rules that were only guidelines, such as no `../` imports, are now lint errors.
2. Write repositories are minimal and read repositories are read-only.
3. Each context registers its own exception mapping; `core` knows no context.
4. Domain events have real consumers: handlers and projections.
5. Builders build aggregates only.
6. The frontend gets a composition root, a query key factory, typed routing and i18n keys, and always-present use cases.

Vitest replaces Jest ([D14](/adr/d14-testing/)), and the shared building blocks are our own ([D24](/adr/d24-own-building-blocks/)).
