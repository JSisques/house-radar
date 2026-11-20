---
title: "D1. Lenguaje"
description: "TypeScript de punta a punta (API, web, ingestion). Python para ingestion queda como opción en V2 si se justifica."
sidebar:
  order: 2
---

- **Estado:** Aceptada
- **Fecha:** 2026-11-20

## Contexto

La plataforma incluye una API, una aplicación web y workers de ingestion, y requiere elegir un lenguaje para todos ellos.

## Decisión

TypeScript de punta a punta (API, web, ingestion). Python para ingestion queda como opción en V2 si se justifica.

## Consecuencias

- El modelo de dominio normalizado se comparte como paquete interno (`packages/domain`), tipado de punta a punta.
- Un cambio en el modelo se resuelve en un único PR atómico.
- Los límites entre módulos los impone la arquitectura (paquetes y dependencias explícitas), no la separación en repositorios.
- La ingestion es una aplicación independiente: podría reescribirse en otro lenguaje sin afectar al resto si se respeta su contrato.

Las consecuencias se comparten con [D2](/es/adr/d02-repository-strategy/).

## Alternativas consideradas

- Python para ingestion: se mantiene como opción en V2 si se justifica.

## Actualización (2026-11-20)

El paquete compartido `packages/domain` mencionado arriba se sustituyó por dos paquetes sin dependencias de framework, `packages/building-blocks` (bloques DDD genéricos) y `packages/shared-kernel` (conceptos de House Radar compartidos por dos o más contextos); véase [D24](/es/adr/d24-own-building-blocks/). Los datos que se comparten con la web llegan mediante el cliente OpenAPI ([D22](/es/adr/d22-api-style/)).
