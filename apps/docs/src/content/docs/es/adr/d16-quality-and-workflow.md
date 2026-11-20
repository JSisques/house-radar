---
title: "D16. Calidad y flujo de trabajo"
description: "GitHub Actions (lint, typecheck, test y build de lo afectado con Turborepo), límites arquitectónicos verificados en CI, Conventional Commits"
sidebar:
  order: 17
---

- **Estado:** Aceptada
- **Fecha:** 2026-11-20

## Contexto

El proyecto sigue estándares de producto real ([D0](/es/adr/d00-project-purpose/)) y necesita un flujo de entrega y controles de calidad definidos.

## Decisión

GitHub Actions (lint, typecheck, test y build de lo afectado con Turborepo), límites arquitectónicos verificados en CI, Conventional Commits con commitlint, ramas de feature cortas con PR a `main` y versiones de Node y pnpm fijadas en el repositorio.

## Consecuencias

- El registro de decisiones no recoge consecuencias adicionales para esta decisión, más allá de la propia decisión.
