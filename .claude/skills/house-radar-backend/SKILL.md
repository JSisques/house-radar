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
- Aggregates use value objects, never raw primitives; they `record()` events in named methods and never publish. The command handler publishes `pullDomainEvents()`.
- Write repositories expose only `save`, `findById`, `delete`. Read repositories are read-only.
- Bind repositories and ports with `Symbol` tokens and `I`-prefixed interfaces. Providers go in named arrays with `{ provide, useClass }`.
- Cross-context calls only through `application/ports/*.port.ts` + `infrastructure/adapters/`, or events.
- No barrel files. Use aliases (`@contexts/*`, `@core/*`, `@shared/*`); relative imports only in the same directory.
- One type per file, kebab-case with role suffix. One folder per command/query holding message, handler and spec.
- Throw typed exceptions (no `Result`). REST only. No `any`.
- Unit specs use Vitest and manual mocks; never `@nestjs/testing`.

## Decision Gates

| Need | Do |
| --- | --- |
| Change state | Command + handler returning `{ id }` at most |
| Read data | Query + handler on a read repository |
| Call another context | Port in `application/ports` + adapter |
| New value object used by 2+ contexts | `packages/shared-kernel`; otherwise inside the context |
| Generic DDD base, no House Radar concept | `packages/building-blocks` |
| Domain event reaction | Event handler or projection in `application` |

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
- `assets/` templates (command, handler, spec, aggregate, value object, query)
