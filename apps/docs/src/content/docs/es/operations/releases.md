---
title: "Lanzamientos"
description: "Cómo cortar un lanzamiento en House Radar usando release-please."
sidebar:
  order: 6
---

## Descripción general

House Radar utiliza una única versión SemVer para todo el monorepo, gestionada por [release-please](https://github.com/googleapis/release-please). Los cambios de versión y las entradas del changelog son **automáticos**; el lanzamiento es una **decisión humana**.

## Cómo funciona

1. Los desarrolladores escriben [Conventional Commits](/es/adr/d16-quality-and-workflow/) en ramas de feature.
2. Cuando se fusiona un commit `feat:` o `fix:` (o un cambio breaking) en `main`, el [workflow de release-please](https://github.com/JSisques/house-radar/blob/main/.github/workflows/release-please.yml) (`.github/workflows/release-please.yml`) se ejecuta.
3. release-please abre un **PR de Release** que acumula todas las entradas del changelog desde el último lanzamiento y propone el siguiente salto de versión.
4. Un mantenedor revisa y **fusiona el PR de Release**. Esto crea la etiqueta `vX.Y.Z`, el GitHub Release y actualiza `CHANGELOG.md`.

### Reglas de salto de versión

| Tipo de commit | Salto |
|---|---|
| `fix:` | patch (`0.0.x` → `0.0.(x+1)`) |
| `feat:` | minor (`0.x.0` → `0.(x+1).0`) |
| Cambio breaking (`BREAKING CHANGE:` o `!`) | major (hasta `1.0.0`), luego major |

Antes de `1.0.0` (M0–M6), los cambios breaking aumentan la versión **minor**, no la major. Esto se controla con `"bump-minor-pre-major": true` en [`release-please-config.json`](https://github.com/JSisques/house-radar/blob/main/release-please-config.json).

## Cortar un lanzamiento

1. **Verifica el PR de Release.** Abre el último PR de release-please y comprueba:
   - Que el salto de versión es correcto para los cambios acumulados.
   - Que las entradas del changelog son precisas y legibles.
   - Que todas las pruebas del pipeline de CI pasan.
2. **Fusiona el PR de Release** a `main`.
3. **Verifica la etiqueta y el lanzamiento.** Tras la fusión:
   - Existe una etiqueta `vX.Y.Z` en el commit de fusión.
   - Se ha creado un GitHub Release con el changelog como notas de versión.
   - `CHANGELOG.md` está actualizado con la cabecera de la nueva versión.
4. **Despliega** la versión etiquetada a staging/producción como de costumbre.

## Configuración

| Archivo | Propósito |
|---|---|
| [`release-please-config.json`](https://github.com/JSisques/house-radar/blob/main/release-please-config.json) | Configuración de release-please: paquete raíz único, `bump-minor-pre-major`, ruta del changelog. |
| [`.release-please-manifest.json`](https://github.com/JSisques/house-radar/blob/main/.release-please-manifest.json) | Fichero de estado con la última versión publicada por ruta de paquete. El paquete raíz es `.` (inicialmente `0.0.0`). |
| [`version.txt`](https://github.com/JSisques/house-radar/blob/main/version.txt) | Fichero de versión del producto que release-please actualiza en cada lanzamiento (inicialmente `0.0.0`). |
| [`.github/workflows/release-please.yml`](https://github.com/JSisques/house-radar/blob/main/.github/workflows/release-please.yml) | Workflow de GitHub Actions que se activa en pushes a `main`. |
| [`CHANGELOG.md`](https://github.com/JSisques/house-radar/blob/main/CHANGELOG.md) | Changelog legible por humanos, mantenido automáticamente por release-please. |

## Requisitos

Se necesita un token de GitHub con permisos `contents: write` y `pull-requests: write`. Guárdalo como el secreto del repositorio `RELEASE_PLEASE_TOKEN`.

## FAQ

**P: ¿Puedo saltarme un salto de versión?**
R: No. release-please calcula el salto automáticamente a partir de los Conventional Commits. Si no quieres un salto, no fusiones un `feat:`, `fix:` o cambio breaking hasta que estés listo.

**P: ¿Qué pasa si fusiono un commit `docs:` o `chore:` en main?**
R: release-please ignora estos tipos de commit. No pasa nada.

**P: ¿Puedo lanzar más de una versión de producto?**
R: No por ahora. House Radar utiliza una única versión para todo el monorepo. Los paquetes internos (`building-blocks`, `shared-kernel`) siguen la versión del producto. Si algún paquete interno se publicara en npm de forma independiente, podría cambiar a una versión independiente más adelante.
