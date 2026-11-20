---
title: "D2. Estrategia de repositorios"
description: "Monorepo único `house-radar` (pnpm workspaces + Turborepo) que incluye código, infraestructura y documentación."
sidebar:
  order: 3
---

- **Estado:** Aceptada
- **Fecha:** 2026-11-20

## Contexto

El código, la infraestructura y la documentación requerían una organización de repositorios. El repositorio provisional `house-radar-docs` se moverá a `apps/docs` cuando se cree el monorepo.

## Decisión

Monorepo único `house-radar` (pnpm workspaces + Turborepo) que incluye código, infraestructura y documentación.

## Consecuencias

- El modelo de dominio normalizado se comparte como paquete interno (`packages/domain`), tipado de punta a punta.
- Un cambio en el modelo se resuelve en un único PR atómico.
- Los límites entre módulos los impone la arquitectura (paquetes y dependencias explícitas), no la separación en repositorios.
- La ingestion es una aplicación independiente: podría reescribirse en otro lenguaje sin afectar al resto si se respeta su contrato.

Las consecuencias se comparten con [D1](/es/adr/d01-language/).
