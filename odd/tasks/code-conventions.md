# Feature: code-conventions

## Objective

Define the code conventions for the House Radar monorepo (backend, frontend, shared packages, tooling) before writing application code, and publish them in the docs portal (`architecture/conventions`, en + es) plus ADRs for the structural decisions.

## Status

Discovery in progress. Decisions are recorded here as they are taken; docs pages and ADRs are written once discovery closes.

## References

- `gardenia-api` (author's NestJS project): baseline conventions, refined here.
- `@sisques-labs/nestjs-kit` (author's kit): reference design for building blocks; not used as a dependency.
- `gardenia-web`: reference for frontend conventions (to be mapped).

## Decisions taken (2026-11-20, user-approved)

### C1. Backend structure (apps/api, apps/ingestion)

- Screaming architecture by bounded context: `src/contexts/<context>/{domain,application,infrastructure,transport}`, plus `src/core/` (app-wide infrastructure: config, filters, health, observability) and `src/shared/` (cross-context Nest pieces).
- Dependencies point inward: `transport`/`infrastructure` → `application` → `domain`. `domain` imports nothing framework-related.
- Cross-context communication only through `application/ports/*.port.ts`, implemented in `infrastructure/adapters/` (the only place allowed to import another context), or through events.

### C2. CQRS with `@nestjs/cqrs`

- `application/` contains `commands/`, `queries/`, `services/` (and `ports/`, event handlers).
- One folder per item, named after it, containing the message, its handler and its spec:
  - `commands/import-manual-listing/{import-manual-listing.command.ts, import-manual-listing.handler.ts, import-manual-listing.handler.spec.ts}`
  - `queries/property-find-by-id/{property-find-by-id.query.ts, property-find-by-id.handler.ts, property-find-by-id.handler.spec.ts}`
- Services split into `services/write/` and `services/read/` (e.g. `assert-property-exists`).
- Handlers only go through repositories/services; transport only goes through CommandBus/QueryBus.

### C3. Infrastructure and transport layers

- `infrastructure/`: `persistence/mikro-orm/{schemas,mappers,repositories}`, `adapters/`, messaging (BullMQ) and other outbound technology.
- `transport/`: everything inbound — `rest/{controllers,dtos,mappers}`, `exceptions/`. REST only (D22): no GraphQL, no MCP.

### C4. Conventions kept from gardenia-api

- Aggregates composed of value objects (never raw primitives), created through builders, events raised in named methods (`create()`, `changePrice()`), `toPrimitives()`.
- Read and write repositories separated, bound with `Symbol` tokens and `I`-prefixed interfaces.
- Module providers grouped in named arrays (`COMMAND_HANDLERS`, `QUERY_HANDLERS`, `APPLICATION_SERVICES`, `DOMAIN_BUILDERS`, `INFRASTRUCTURE_MAPPERS`, `INFRASTRUCTURE_REPOSITORIES`, `INFRASTRUCTURE_ADAPTERS`, `REST_CONTROLLERS`); `{ provide, useClass }` bindings, no `useExisting`.
- kebab-case file names with role suffixes (`.aggregate`, `.value-object`, `.builder`, `.event`, `.exception`, `.command`, `.query`, `.handler`, `.service`, `.port`, `.adapter`, `.mapper`, `.repository`, `.schema`, `.controller`, `.dto`, `.view-model`, `.primitives`, `.spec`); PascalCase classes with suffix; `UPPER_SNAKE` tokens.
- One type per file (exception: `{Name}CommandInput`/`{Name}QueryInput` inline in the command/query file).
- No barrel files. Path aliases (`@contexts/*`, `@core/*`, `@shared/*`); relative imports only within the same directory.
- Colocated `*.spec.ts`; unit specs instantiate classes manually with mocks (no `@nestjs/testing` in unit specs); integration specs `*.integration-spec.ts`, e2e `*.e2e-spec.ts`.
- Exceptions (no Result types), mapped to HTTP by a global filter.

### C5. Refinements over gardenia-api

1. The "no `../` imports" rule is enforced by ESLint (310 violations exist in gardenia because it was not).
2. Write repositories expose only `save`, `findById`, `delete` (no criteria search); read repositories are read-only (`findById`, `findByCriteria`).
3. Exception-to-HTTP status mapping is registered by each context, not imported by `core` (adding a context must not edit core).
4. Domain events have consumers: event handlers and projections are first-class (e.g. the D19 representative price read model).
5. Builders have a single role: aggregate builders build aggregates; view models are built by mappers/projections.
6. Tooling: Vitest instead of Jest (D14), ESLint flat config, `@typescript-eslint/no-explicit-any` enabled, commitlint enforced (D16), strict TypeScript.

### C6. Shared packages (own base, not `@sisques-labs/nestjs-kit`)

Reason: the kit's `BaseAggregate` extends `@nestjs/cqrs` `AggregateRoot` (framework in the domain, violates D4), it is coupled to TypeORM (D6 is MikroORM), compiles non-strict, and forces `findByCriteria` on write repositories. Both packages are framework-free TypeScript.

**`packages/building-blocks` (`@house-radar/building-blocks`)** — generic DDD building blocks, no House Radar concepts.

- Taken from the kit: value object base with mandatory `validate()`, one typed exception per VO, `toPrimitives()`; option-configured generic VOs (String, Number, Uuid, Enum, Date, Boolean); event envelope (`schemaVersion`, `correlationId`, `causationId`) and `generateEventMetadata()`; builder base with `validate()` throwing `FieldIsRequiredException`; `Criteria` + `PaginatedResult` + `FilterFieldRegistry`; separate read/write repository ports.
- Refined: aggregate keeps its own event buffer (`record()`, `pullDomainEvents()`) and infrastructure publishes to the Nest `EventBus`; aggregate identity is any identity VO (not hard-coded UUID); typed, null-safe equality (no `JSON.stringify`); immutability (`Criteria`, defensive copies in `DateValueObject`); `DateValueObject` rejects invalid dates; `DomainException` with `code` and `cause`; `occurredAt` spelling; no `any` in `Filter.value`; strict TypeScript; UUIDs via `globalThis.crypto.randomUUID()` (browser-compatible, used by `apps/web`).
- Excluded: project-specific VOs mixed in the kit (color, phone, password, user roles…); added only when needed.

**`packages/shared-kernel` (`@house-radar/shared-kernel`)** — House Radar concepts used by two or more contexts; depends on `building-blocks`.

- `Money` (EUR, integer cents), `Area` (m²), `PricePerSquareMeter`.
- `GeoPoint`, `LocationPrecision` (D18), `MunicipalityCode`.
- Closed catalogs: `PropertyType`, `PropertyCondition`, `EnergyCertificate`.
- Provenance: `SourceId`, `ExternalId`, `ListingUrl` (D17 normalization).
- Cross-context identities: `PropertyId`, `ListingId` (aggregates reference each other by ID).
- `Known<T> | Unknown` with data origin (declared / calculated / inferred): product principle 4 at type level.

Not in either package: concrete aggregates, commands/queries, DTOs, ORM mappings.

Consumers: `apps/api` and `apps/ingestion` use both; `apps/web` uses `building-blocks` for its own domain and `shared-kernel` only where a VO fits as-is (data arrives from the OpenAPI client, D22).

### C7. Testing style

Kept from the kit/gardenia: `describe` per class, nested `describe` per method, one `it('should …')` per case/edge case, no `TestingModule` in domain/application unit specs. Runner: Vitest.

### C8. Frontend structure and rules (apps/web)

Baseline: `gardenia-web` conventions, refined.

Kept:

- `src/contexts/<context>/{domain,application,infrastructure,presentation}` + `src/shared/` + `src/design-system/` (`contexts/` instead of gardenia's `core/`, aligned with the API).
- State by data origin: server data only in TanStack Query; shared client state in Zustand; local state in `useState`/`useReducer`. Server data is never mirrored into a store.
- Hooks are the only bridge from presentation to application.
- One folder per component with colocated `.spec.tsx` and `.stories.tsx`; named exports only; no barrels; kebab-case files with role suffixes (`.use-case.ts`, `.repository.port.ts`, `.screen.tsx`, `.hook.ts`, `.store.ts`, `.schema.ts`, …).
- Tailwind + shadcn/ui, react-hook-form + zod, Storybook, debounced search inputs, mutations return `{ id }` instead of re-fetching.

Refined:

1. Layer boundaries enforced by ESLint (as in the backend).
2. Composition root: adapters are injected through a provider; no module-scope `new UseCase(repo)` in hooks; tests swap adapters without `vi.mock`.
3. No server data in Zustand; `application` never imports stores.
4. Query key factory per context.
5. i18n through a hook (`useTranslation`) with one namespace per context, behind an adapter (D12); no `dict` prop-drilling; per-context locale parity test kept.
6. Standard error handling: error boundary + domain-error-to-translated-message mapping.
7. Formal atomic design in `shared/presentation/components/{atoms,molecules,organisms,templates}`; explicit container/presentational split inside contexts.
8. MSW for API mocking in tests and Storybook; Playwright for E2E (D14).
9. Rich domain using `@house-radar/building-blocks` (VOs, models), not interfaces-only.
10. API access through the OpenAPI-generated client (D22) wrapped by repository adapters.

### C9. Frontend application layer

- Use cases are ALWAYS present (user decision 2026-11-20), one folder per use case (`application/use-cases/<verb-noun>/<verb-noun>.use-case.ts` + spec), even when they only delegate to a port. Reason: a rule without exceptions can be enforced by lint; "only when there is logic" is a judgment rule that erodes (as seen in gardenia).

### C10. Router

- TanStack Router (user decision 2026-11-20). Search params typed and validated with zod in the route definition (invalid values fall back to defaults), type-safe navigation (broken links are compile errors), integration with TanStack Query. Reason: the search state lives in the URL (HR-F003-BR11, ~20 filters), so typing and validating the URL is typing and validating the search.

### C11. Internationalization library

- react-i18next (user decision 2026-11-20), behind the i18n adapter (D12): one namespace per context, typed keys via TypeScript resource declaration (a misspelled key does not compile), lazy loading per locale, locale parity verified by test.
- Prices, areas and dates are formatted with the native `Intl` API (`Intl.NumberFormat` with `currency: 'EUR'`, `Intl.DateTimeFormat`) inside the adapter.
- Adding Galician or Catalan means adding translation files only.

### C12. Lint and format tooling

- ESLint (flat config) + Prettier across the monorepo (user decision 2026-11-20). ESLint enforces architecture boundaries with `eslint-plugin-boundaries` (core of D10/C5); Prettier only formats. Speed handled by lint-staged (changed files only) and Turborepo caching.
- Defaults (proposed, not contested): Prettier `singleQuote`, `trailingComma: all` (as in gardenia); import ordering with `eslint-plugin-simple-import-sort` (builtins → external → `@house-radar/*` → internal aliases → same-directory relative); husky + lint-staged on pre-commit; commitlint on commit-msg.

## Pending discovery

- None.

## Tasks (output)

| ID | Task | Route | Status | Commit |
|----|------|-------|--------|--------|
| T1 | Docs page `architecture/conventions` (en + es) with C1–C12 detail; link from architecture overview | delegated (writer trigger: 2+ files) | [ ] | |
| T2 | ADRs D24 own building blocks (`building-blocks` + `shared-kernel`) instead of the kit, D25 CQRS with `@nestjs/cqrs` + per-context structure, D26 TanStack Router, D27 react-i18next (en + es) + ADR index | delegated | [ ] | |
| T3 | Agent skills `.claude/skills/house-radar-backend/` and `.claude/skills/house-radar-frontend/` (LLM-first, skill style guide), plus `AGENTS.md` registry and `CLAUDE.md` pointer | delegated | [ ] | |

Checks: `pnpm docs:test`, `pnpm docs:check-i18n`, `pnpm docs:check`, `pnpm docs:build`; skills: frontmatter valid, body within token budget, references resolve to local files. TDD (D14) not applicable: documentation and agent instructions.
- Lint/format tooling details, import ordering.
- Documentation output (docs page + ADRs).
