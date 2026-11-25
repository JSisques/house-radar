---
name: house-radar-backend
description: "Trigger: apps/api, apps/ingestion, NestJS, CQRS, aggregate, value object, command, query handler, building-blocks, shared-kernel. Write House Radar backend code per conventions."
license: Apache-2.0
metadata:
  author: "JSisques"
  version: "1.0"
---

## Activation Contract

Load when creating or editing code in `apps/api`, `apps/ingestion`, `packages/building-blocks` or `packages/shared-kernel`.

## Hard Rules

- Dependencies point inward: `transport`/`infrastructure` -> `application` -> `domain`. Domain imports no NestJS, MikroORM or `@nestjs/cqrs`.
- Aggregates use value objects, never raw primitives; they `record()` events in named methods and never publish.
- Persistence rows are `defineEntity` schemas (D38): the row type is `InferEntity<typeof Schema>`, never a hand-written interface. Use `.strictNullable()`, `.columnType('numeric')` for decimals, and omit `version`/`createdAt`/`updatedAt` in `toRow`.
- Aggregates have no `createdAt`/`updatedAt`: the infrastructure schema fills `created_at`/`updated_at`. Business dates are their own value objects.
- Domain interfaces (for example `IListingProps`) live in `domain/interfaces/<name>.interface.ts`, one per file; primitives stay in `domain/primitives/`.
- Events: aggregates `record()`; the write repository saves the aggregate and `peekDomainEvents()` into `outbox_event` in one `em.transactional`, then `markPersisted(version)` and `clearDomainEvents()` after commit. Never publish from handlers (no `EventBus`).
- Write repositories update the managed entity (`LockMode.OPTIMISTIC` + `lockVersion`, then `assign`); insert only when `isNew()`.
- IDs are UUIDv7 (`uuid` package, `v7()`), never `crypto.randomUUID()`.
- Write repositories expose only `save`, `findById`, `delete`. Read repositories are read-only.
- Bind repositories and ports with `Symbol` tokens and `I`-prefixed interfaces. Providers go in named arrays with `{ provide, useClass }`.
- Cross-context calls only through `application/ports/*.port.ts` + `infrastructure/adapters/`, or events.
- No barrel files. Use aliases (`@contexts/*`, `@core/*`, `@shared/*`); relative imports only in the same directory.
- One type per file, kebab-case with role suffix. One folder per command/query holding message, handler and spec.
- Commands and queries carry value objects built in their constructor from a primitives `Input`.
- Builders are stateful and never providers. Inject the stateless `I<Name>BuilderFactory` (Symbol token, registered in `DOMAIN_BUILDER_FACTORIES`) and call `create()` per execution. Factories live in `domain/`, without `@Injectable()`.
- A missing entity raises a typed exception through an `Assert…ExistsService`; never return `null` to transport.
- Throw typed exceptions (no `Result`). REST only. No `any`, no `as never`.
- Unit specs use Vitest and manual mocks; never `@nestjs/testing`.

## Decision Gates

| Need | Do |
| --- | --- |
| Change state | Command + handler returning `{ id }` at most |
| Read data | Query + handler on a read repository |
| Call another context | Port in `application/ports` + adapter |
| New value object used by 2+ contexts | `packages/shared-kernel`; otherwise inside the context |
| Generic DDD base, no House Radar concept | `packages/building-blocks` |
| React to an event | `transport/messaging/consumers/` BullMQ consumer -> command via `CommandBus`; handler idempotent through ports (`ITransactionManager`, `IProcessedEventRepository.claim`) and ordered by `aggregate_version` (ignore events older than the applied version) |
| Persist aggregate | Write repository saving aggregate + outbox events in one transaction (`write-repository.template.ts`) |

## Execution Steps

1. Read `references/conventions.md`; copy the matching file from `assets/`.
2. RED: write the spec first and run it; confirm it fails.
3. GREEN: implement the minimum in the correct layer folder.
4. Refactor with specs green; register the provider in the module array.
5. Run the package tests with Vitest; run ESLint/Prettier when installed.

## Output Contract

Return: files created or changed, RED and GREEN results, checks run, and any rule you could not satisfy.

## References

- `references/conventions.md`
- `assets/` templates (command, handler, spec, aggregate, aggregate builder, aggregate builder factory, value object + exception, primitives, query, query handler, assert-exists service, write repository with outbox, event consumer, projection handler, processed-event repository)
