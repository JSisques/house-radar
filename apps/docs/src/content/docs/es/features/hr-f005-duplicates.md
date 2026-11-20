---
title: "HR-F005: Detección de duplicados"
description: "Una misma vivienda puede aparecer anunciada en varios portales. House Radar debe diferenciar entre el inmueble real y los anuncios publicados sobre él."
sidebar:
  order: 5
---

- **Prioridad:** P0
- **Sección de origen:** 5
- **Módulo responsable:** Por definir

Una misma vivienda puede aparecer anunciada en varios portales. House Radar debe diferenciar entre el inmueble real y los anuncios publicados sobre él.

## Requisitos

- [ ] Detección por identificador externo.
- [ ] Detección por coincidencia de dirección o ubicación.
- [ ] Comparación de superficie.
- [ ] Comparación de precio.
- [ ] Comparación de habitaciones.
- [ ] Detección de posibles duplicados.
- [ ] Vinculación de varios anuncios a una misma propiedad.
- [ ] Posibilidad de resolver manualmente coincidencias dudosas.

## Notas

- **Criterio recomendado:** en la primera versión, el sistema debe señalar coincidencias probables y permitir revisión manual. Es preferible no fusionar automáticamente dos viviendas distintas.
- Criterios de aceptación y dependencias: por definir en la especificación funcional detallada.
