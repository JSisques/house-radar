---
title: "D33. Versionado y releases"
description: "Una única versión de producto para todo el monorepo, gestionada con release-please mediante una Release PR, versiones 0.x hasta la Release 1.0 e imágenes Docker etiquetadas con versión y SHA del commit."
sidebar:
  order: 34
---

- **Estado:** Aceptada
- **Fecha:** 2026-11-20

## Contexto

House Radar es un monorepo ([D2](/es/adr/d02-repository-strategy/)) con las aplicaciones `api`, `web`, `ingestion` y `docs` y dos paquetes internos. Los commits siguen Conventional Commits, verificados con commitlint ([D16](/es/adr/d16-quality-and-workflow/)). Todo el producto se despliega como un único stack de Docker Compose ([D8](/es/adr/d08-deployment/)): no hay despliegues independientes ni se publica nada en npm. Hace falta un modelo de versionado y un proceso de release para que el servidor despliegue una versión exacta y pueda volver atrás.

## Decisión

- **Una única versión de producto** para todo el monorepo: `api`, `web`, `ingestion` y `docs` se publican juntas bajo un único número SemVer y una única etiqueta (por ejemplo `v1.4.0`). Los paquetes internos (`building-blocks`, `shared-kernel`) son `private` y siguen la versión del producto.
- **release-please** (GitHub Action) con un único paquete raíz. En cada merge a `main` mantiene una Release PR que acumula el changelog y la siguiente versión calculada a partir de Conventional Commits: `fix` incrementa el parche, `feat` el menor y un cambio incompatible el mayor.
- Al fusionar la Release PR se crean la etiqueta y la GitHub Release y se actualiza `CHANGELOG.md`. La versión y el changelog son automáticos; publicar es una decisión humana.
- **Versiones `0.x` hasta M6.** Antes de la 1.0, los cambios incompatibles incrementan el menor (`bump-minor-pre-major`). `1.0.0` coincide con la Release 1.0.
- **Las imágenes Docker se etiquetan con la versión del producto y el SHA del commit**, de modo que el servidor despliega una versión exacta y puede volver atrás.
- El versionado y las releases pertenecen al milestone M0 · Foundation.

## Consecuencias

- Un único número identifica lo que se ejecuta en producción y una etiqueta corresponde a un stack desplegable.
- La versión y el changelog se derivan de los mensajes de commit, lo que refuerza la disciplina de Conventional Commits de D16.
- Una release requiere que una persona fusione la Release PR; nada se publica automáticamente en cada push.
- Todas las aplicaciones comparten versión aunque solo haya cambiado una.
- Si algún paquete interno llega a publicarse en npm, podrá pasar a una versión independiente sin afectar al resto.
- Añade al repositorio un workflow de release-please y su configuración.

## Alternativas consideradas

- **Versiones independientes por aplicación y paquete:** añade sobrecoste de compatibilidad entre versiones sin despliegues independientes ni publicación en npm que lo justifiquen. Descartada.
- **semantic-release:** publica en cada push que cumple las condiciones, sin puerta humana. Descartada.
- **Changesets:** exige archivos de changeset por PR, está orientado a la publicación en npm y es redundante con Conventional Commits. Descartada.
