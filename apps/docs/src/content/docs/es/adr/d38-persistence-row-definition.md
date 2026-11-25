---
title: "D38. Filas de persistencia definidas con defineEntity"
description: "Las filas de persistencia siguen siendo esquemas de MikroORM declarados con defineEntity, y el tipo de la fila se infiere del esquema en lugar de usar clases de fila decoradas."
sidebar:
  order: 39
---

- **Estado:** Aceptada
- **Fecha:** 2026-11-25

## Contexto

[D6](/es/adr/d06-persistence/) mapea las filas de persistencia con `EntitySchema` de MikroORM, descubiertos de forma nativa desde `contexts/<ctx>/infrastructure/persistence/mikro-orm/schemas/*.schema.ts`. Cada fila se escribe dos veces: una interfaz de fila a mano y un `EntitySchema` con las mismas propiedades, además de apaños explícitos de `columnType`. Dos issues proponían eliminar la duplicación en sentidos opuestos: #195 infiere el tipo de la fila con `defineEntity`, y #196 sustituye los esquemas por clases de fila solo de infraestructura decoradas con `@Entity()` y `@Property()`. Son mutuamente excluyentes.

Evidencia reunida el 2026-11-25 con MikroORM 7.2.11:

- La toolchain ya soporta decoradores (`experimentalDecorators` y `emitDecoratorMetadata` en `tsconfig.json`, `legacyDecorator` y `decoratorMetadata` en `.swcrc`, `unplugin-swc` en Vitest).
- Las filas de outbox y processed-event se construyen con factorías por contexto (`createOutboxEventSchema`, `createProcessedEventSchema`). Una clase decorada no se puede parametrizar por esquema, así que necesitaría una clase por contexto o una clase base.
- El discovery carga el fichero del esquema en su propia instancia de módulo, por lo que los repositorios resuelven las entidades por nombre. Una clase decorada se cargaría igual, y las clases no eliminan el problema.
- Un spike migró `listing.schema.ts` a `defineEntity`: los 18 tests de integración de listing pasaron sin cambios contra un PostgreSQL real.

## Decisión

Mantener las filas como esquemas de MikroORM y declararlas con `defineEntity` y el constructor de propiedades `p`. El tipo de la fila es `InferEntity<typeof Schema>`, así que se elimina la interfaz de fila escrita a mano. Los agregados de dominio siguen sin importar nada del ORM y los mappers de filas se mantienen. El discovery por el glob `schemas/*.schema.{js,ts}` y la resolución de entidades por nombre no cambian. No se adoptan clases de fila decoradas.

Reglas para la migración:

- `p.decimal()` mapea a `numeric(10,0)` por defecto y pierde los decimales en silencio. Añade siempre `.columnType('numeric')` (o precisión y escala explícitas) a las columnas decimales.
- `createdAt` y `updatedAt` son obligatorios en el tipo inferido. Los contratos `toRow` de los mappers los excluyen, por ejemplo `Omit<ListingRow, 'version' | 'createdAt' | 'updatedAt'>`.
- Las listas de columnas tipadas desde la fila usan `Extract<keyof Row, string>`, porque `keyof` de una fila inferida incluye símbolos internos de MikroORM.
- `p.bigint()` mapea a `bigint` y `p.bigint('string')` a `string`; elige el modo que espera el mapper de dominio.

## Consecuencias

- El tipo de la fila se deriva del esquema y no puede desviarse de él.
- Las convenciones, la skill `house-radar-backend` y el discovery de persistencia no necesitan describir decoradores ni una nueva convención de carpetas.
- Las factorías de outbox y processed-event siguen funcionando sin cambios.
- Quien venga de las clases de entidad de TypeORM se encuentra con una API de constructor en lugar de decoradores.
- Las filas `EntitySchema` existentes se migran en trabajo posterior, seguido en #195.

## Alternativas consideradas

- **Clases de fila decoradas (#196).** Sintaxis conocida y la clase es el tipo de la fila. Descartada: choca con las factorías por contexto, mantiene la resolución por nombre, sigue necesitando tipos de columna explícitos para `numeric` y `bigint`, y acopla las filas a la toolchain de decoradores.
- **Mantener `EntitySchema` con una interfaz escrita a mano.** Descartada: la duplicación es precisamente el problema que se resuelve.
