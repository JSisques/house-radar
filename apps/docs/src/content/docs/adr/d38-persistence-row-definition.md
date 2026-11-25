---
title: "D38. Persistence rows defined with defineEntity"
description: "Persistence rows stay as MikroORM schemas declared with defineEntity, and the row type is inferred from the schema instead of decorated row classes."
sidebar:
  order: 39
---

- **Status:** Accepted
- **Date:** 2026-11-25

## Context

[D6](/adr/d06-persistence/) maps persistence rows with MikroORM `EntitySchema`, discovered natively from `contexts/<ctx>/infrastructure/persistence/mikro-orm/schemas/*.schema.ts`. Each row is written twice: a hand-written row interface and an `EntitySchema` with the same properties, plus explicit `columnType` workarounds. Two issues proposed removing the duplication in opposite ways: #195 infers the row type with `defineEntity`, and #196 replaces the schemas with infrastructure-only row classes decorated with `@Entity()` and `@Property()`. They are mutually exclusive.

Evidence gathered on 2026-11-25 with MikroORM 7.2.11:

- The toolchain already supports decorators (`experimentalDecorators` and `emitDecoratorMetadata` in `tsconfig.json`, `legacyDecorator` and `decoratorMetadata` in `.swcrc`, `unplugin-swc` in Vitest).
- Outbox and processed-event rows are built by per-context factories (`createOutboxEventSchema`, `createProcessedEventSchema`). A decorated class cannot be parameterized by schema, so it would need one class per context or a base class.
- Discovery loads the schema file in its own module instance, so repositories resolve entities by name. A decorated class would be loaded the same way, and the problem is not removed by classes.
- A spike migrated `listing.schema.ts` to `defineEntity`: the 18 listing integration tests passed unchanged against a real PostgreSQL.

## Decision

Keep rows as MikroORM schemas and declare them with `defineEntity` and the `p` property builder. The row type is `InferEntity<typeof Schema>`, so the hand-written row interface is removed. Domain aggregates stay free of ORM imports and the row mappers stay as they are. Discovery by the `schemas/*.schema.{js,ts}` glob and the by-name entity resolution do not change. Decorated row classes are not adopted.

Rules for the migration:

- `p.decimal()` maps to `numeric(10,0)` by default and silently drops decimals. Always add `.columnType('numeric')` (or explicit precision and scale) to decimal columns.
- `createdAt` and `updatedAt` are required in the inferred type. Mapper `toRow` contracts exclude them, for example `Omit<ListingRow, 'version' | 'createdAt' | 'updatedAt'>`.
- Column lists typed from the row use `Extract<keyof Row, string>`, because `keyof` of an inferred row includes MikroORM internal symbols.
- `p.bigint()` maps to `bigint` and `p.bigint('string')` to `string`; pick the mode the domain mapper expects.

## Consequences

- The row type is derived from the schema and cannot drift from it.
- The conventions, the `house-radar-backend` skill and the persistence discovery do not need to describe decorators or a new folder convention.
- The outbox and processed-event factories keep working unchanged.
- Contributors used to TypeORM entity classes meet a builder API instead of decorators.
- All `EntitySchema` rows are migrated to `defineEntity`, including the outbox and processed-event factories. The generated create-schema SQL is identical before and after.

## Alternatives considered

- **Decorated row classes (#196).** Familiar syntax and the class is the row type. Rejected: it conflicts with the per-context factories, keeps the by-name resolution, still needs explicit column types for `numeric` and `bigint`, and couples rows to the decorator toolchain.
- **Keep `EntitySchema` with a hand-written interface.** Rejected: the duplication is the problem being solved.
