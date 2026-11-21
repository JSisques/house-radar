---
title: "D16. Calidad y flujo de trabajo"
description: "GitHub Actions (lint, typecheck, test y build de lo afectado con Turborepo), límites arquitectónicos verificados en CI, Conventional Commits"
sidebar:
  order: 17
---

- **Estado:** Aceptada
- **Fecha:** 2026-11-20
- **Actualizada:** 2026-11-21 (actualizaciones de dependencias con Renovate)

## Contexto

El proyecto sigue estándares de producto real ([D0](/es/adr/d00-project-purpose/)) y necesita un flujo de entrega y controles de calidad definidos.

## Decisión

GitHub Actions (lint, typecheck, test y build de lo afectado con Turborepo), límites arquitectónicos verificados en CI, Conventional Commits con commitlint, ramas de feature cortas con PR a `main`, versiones de Node y pnpm fijadas en el repositorio y actualizaciones de dependencias propuestas por Renovate como PRs con versiones exactas verificadas por CI.

## Consecuencias

- Las dependencias siguen fijadas a versiones exactas. Las actualizaciones llegan como PRs pequeñas de Renovate que pasan commitlint y los controles de CI, así que nadie sube versiones a mano (ver [#148](https://github.com/JSisques/house-radar/issues/148)).
