---
title: "D32. Identificadores UUIDv7"
description: "Los IDs de agregados, eventos y filas del outbox usan UUIDv7 ordenado en el tiempo, generado con el paquete uuid y almacenado en columnas uuid nativas."
sidebar:
  order: 33
---

- **Estado:** Aceptada
- **Fecha:** 2026-11-20

## Contexto

Varias tablas crecen sin límite y son append-only: `observation`, `outbox_event` y `extraction_error` ([D29](/es/adr/d29-aggregate-boundaries/), [D31](/es/adr/d31-transactional-outbox/)). Los identificadores aleatorios (UUIDv4) se insertan en posiciones aleatorias del B-tree de la clave primaria, lo que fragmenta el índice. [D24](/es/adr/d24-own-building-blocks/) generaba los UUID con `globalThis.crypto.randomUUID()`, que produce v4.

## Decisión

- Todos los IDs de agregados, de eventos y de filas del outbox usan UUIDv7.
- Se generan con el paquete `uuid` (`v7()`) en `building-blocks`, que funciona en Node y en el navegador (`apps/web`).
- Tipo de columna: `uuid` nativo ([D6](/es/adr/d06-persistence/)).

## Consecuencias

- Los IDs están ordenados en el tiempo, así que las inserciones se añaden al final del índice y se evita la fragmentación en tablas que crecen.
- Los IDs siguen siendo únicos globalmente y pueden generarse en cualquier lugar, sin consultar la base de datos.
- Ordenar por ID equivale a ordenar por fecha de creación.
- Un ID revela su marca de tiempo de creación; no debe usarse donde eso sea sensible.
- Añade la dependencia `uuid` a `building-blocks`.
- Sustituye en parte la generación de UUID descrita en D24.

## Alternativas consideradas

- **UUIDv4 con `crypto.randomUUID()`:** sin dependencias y funciona en todas partes, pero el orden aleatorio fragmenta los índices de tablas append-only. Descartada.
