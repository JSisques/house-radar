---
title: Roadmap
description: Milestones M0 a M6 hacia la Release 1.0, justificación del orden, modelo de issues y enlaces al tablero de GitHub y a los issues padre.
sidebar:
  order: 6
---

El roadmap convierte las funcionalidades [HR-F001 a HR-F012](/es/features/) y la base técnica en siete milestones ordenados. La primera release, 1.0.0, cierra el [alcance del MVP](/es/product/mvp-scope/). El versionado y las releases siguen [D33](/es/adr/d33-versioning-and-releases/): `0.x` hasta M6 y después `1.0.0`.

- Tablero del proyecto: [proyecto de GitHub](https://github.com/users/JSisques/projects/16)
- Milestones: [milestones de GitHub](https://github.com/JSisques/house-radar/milestones)

## Milestones

| Milestone | Objetivo | Alcance | Funcionalidades |
| --- | --- | --- | --- |
| M0 · Foundation | Monorepo listo para escribir código con TDD | Tooling (Turborepo, ESLint, Prettier, commitlint, husky), `building-blocks`, `shared-kernel`, esqueletos de `api`/`web`/`ingestion`, Docker Compose (Postgres + PostGIS, Redis), outbox y relay, base de observabilidad, herramientas de release | Base técnica ([D2](/es/adr/d02-repository-strategy/), [D16](/es/adr/d16-quality-and-workflow/), [D24](/es/adr/d24-own-building-blocks/), [D31](/es/adr/d31-transactional-outbox/), [D33](/es/adr/d33-versioning-and-releases/)) |
| M1 · Walking skeleton | Atravesar todas las capas con un flujo real | Importación manual (formulario asistido), `Listing` y `Observation`, `Property` 1:1, página de detalle, listado básico | [HR-F001](/es/features/hr-f001-ingestion/) (parte manual), [HR-F002](/es/features/hr-f002-normalization/), [HR-F004](/es/features/hr-f004-property-detail/) (básico) |
| M2 · Search & map | La búsqueda real | `geography` (importación del IGN), todos los filtros, URL tipada, mapa MapLibre con clustering | [HR-F003](/es/features/hr-f003-search/), [HR-F006](/es/features/hr-f006-map/) |
| M3 · History & duplicates | El valor diferencial | Comprobar anuncio, histórico y gráfica, anuncios desaparecidos, candidatos a duplicado y su resolución | [HR-F005](/es/features/hr-f005-duplicates/), [HR-F008](/es/features/hr-f008-price-history/) |
| M4 · Users | Producto personal completo, ejecutándose en el servidor propio | Autenticación con cuenta creada por seed, favoritos, búsquedas guardadas, preferencias; despliegue de producción con Docker Compose y copias de seguridad | [HR-F007](/es/features/hr-f007-favorites-saved-searches/), [HR-F010](/es/features/hr-f010-users/) |
| M5 · Automated ingestion | Datos sin trabajo manual | Conector de idealista (si se concedió la clave), ejecuciones, reintentos, desaparición automática, panel de ingestion y alertas | [HR-F001](/es/features/hr-f001-ingestion/) (parte automática), [HR-F012](/es/features/hr-f012-admin-observability/) |
| M6 · Dashboard → Release 1.0 | Cerrar el MVP | Estadísticas y dashboard, runbooks, aceptación del alcance del producto y corte de la 1.0.0 | [HR-F009](/es/features/hr-f009-dashboard/) |

[HR-F011](/es/features/hr-f011-notifications/) (notificaciones, P2) queda fuera de la release 1.0 y no tiene milestone.

## Justificación del orden

Los milestones se ordenan por dependencias y riesgo, no por número de funcionalidad.

- M0 es grande a propósito: sin `building-blocks`, el outbox y las comprobaciones de límites en CI, el primer agregado se escribiría sin las reglas acordadas.
- M1 va antes que la búsqueda completa: si el esqueleto de punta a punta falla, falla en un solo flujo y no en veinte filtros.
- Búsqueda y mapa (M2) van antes que el histórico (M3), que depende de las observaciones que M1 ya produce.
- El despliegue y las copias de seguridad están en M4, junto con la autenticación: nada se expone a la red sin autenticación, y desde M4 House Radar se ejecuta en el servidor con datos reales y empieza a acumular histórico, su principal activo. Las alertas de producción llegan en M5.
- La ingestion automática (M5) depende de una clave de idealista que puede no concederse, por lo que no bloquea el resto del producto.
- Los runbooks y el corte de la 1.0 cierran el roadmap en M6.

## Modelo de issues

- Un issue por slice vertical: una pieza entregable de unas 400 líneas modificadas de autoría propia (heurística de planificación, no un tope) con sus propios criterios de aceptación tomados de `HR-FNNN-ACn`, construida con TDD estricto ([D14](/es/adr/d14-testing/)) y entregada como una pull request revisable.
- Cada funcionalidad es un issue padre y sus slices son sub-issues enlazados. La base técnica tiene su propio issue padre.
- Etiquetas: contexto y aplicación (`ctx:<contexto>`, `app:<aplicación>`, `pkg:<paquete>`), tipo (`type:feature`, `type:foundation`, `type:docs`) y prioridad (`P0` a `P2`).
- Un tablero de proyecto de GitHub sigue el flujo de los issues.

## Profundidad de la planificación

Todo se divide en slices desde el principio: los siete milestones tienen sus issues de slice vertical, además de un issue padre por funcionalidad y otro para la base técnica. [HR-F011](/es/features/hr-f011-notifications/) tiene un issue padre sin milestone. El plan completo está versionado y fue revisable antes de crear los issues en GitHub.

## Issues padre

| Padre | Milestone | Issue |
| --- | --- | --- |
| Base técnica | M0 · Foundation | [#3](https://github.com/JSisques/house-radar/issues/3) |
| [HR-F001 · Ingesta de anuncios](/es/features/hr-f001-ingestion/) | M1 (manual), M5 (automática) | [#4](https://github.com/JSisques/house-radar/issues/4) |
| [HR-F002 · Normalización de anuncios](/es/features/hr-f002-normalization/) | M1 | [#5](https://github.com/JSisques/house-radar/issues/5) |
| [HR-F003 · Búsqueda y filtros](/es/features/hr-f003-search/) | M2 | [#6](https://github.com/JSisques/house-radar/issues/6) |
| [HR-F004 · Detalle de propiedad](/es/features/hr-f004-property-detail/) | M1 (básico), milestones posteriores | [#7](https://github.com/JSisques/house-radar/issues/7) |
| [HR-F005 · Detección de duplicados](/es/features/hr-f005-duplicates/) | M3 | [#8](https://github.com/JSisques/house-radar/issues/8) |
| [HR-F006 · Mapa](/es/features/hr-f006-map/) | M2 | [#9](https://github.com/JSisques/house-radar/issues/9) |
| [HR-F007 · Favoritos y búsquedas guardadas](/es/features/hr-f007-favorites-saved-searches/) | M4 | [#10](https://github.com/JSisques/house-radar/issues/10) |
| [HR-F008 · Histórico de precios](/es/features/hr-f008-price-history/) | M3 | [#11](https://github.com/JSisques/house-radar/issues/11) |
| [HR-F009 · Dashboard](/es/features/hr-f009-dashboard/) | M6 | [#12](https://github.com/JSisques/house-radar/issues/12) |
| [HR-F010 · Usuarios y autenticación](/es/features/hr-f010-users/) | M4 | [#13](https://github.com/JSisques/house-radar/issues/13) |
| [HR-F011 · Notificaciones](/es/features/hr-f011-notifications/) | Ninguno (posterior a la 1.0) | [#14](https://github.com/JSisques/house-radar/issues/14) |
| [HR-F012 · Administración y observabilidad](/es/features/hr-f012-admin-observability/) | M5 | [#15](https://github.com/JSisques/house-radar/issues/15) |

## Issues por milestone

| Milestone | Issues padre | Issues de slice |
| --- | --- | --- |
| M0 · Foundation | 1 | 26 |
| M1 · Walking skeleton | 3 | 14 |
| M2 · Search & map | 2 | 16 |
| M3 · History & duplicates | 2 | 14 |
| M4 · Users | 2 | 16 |
| M5 · Automated ingestion | 1 | 17 |
| M6 · Dashboard → Release 1.0 | 1 | 9 |
| Sin milestone (HR-F011) | 1 | 0 |
| **Total** | **13** | **112** |

## Requiere definición antes de empezar

El despliegue de producción ([#100](https://github.com/JSisques/house-radar/issues/100)) y las copias de seguridad ([#101](https://github.com/JSisques/house-radar/issues/101)) están en M4 y deben aclararse antes de empezar el trabajo de M4:

- El procedimiento de despliegue en el servidor propio con Docker Compose ([D8](/es/adr/d08-deployment/)).
- Los entornos implicados.
- La gestión de secretos.
- La estrategia de copias de seguridad y recuperación.
