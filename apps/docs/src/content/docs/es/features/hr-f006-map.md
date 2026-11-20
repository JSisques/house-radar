---
title: "HR-F006: Mapa inmobiliario"
description: "Mapa interactivo para visualizar y explorar propiedades."
sidebar:
  order: 6
---

- **Prioridad:** P1
- **Sección de origen:** 6
- **Módulo responsable:** Por definir

Mapa interactivo para visualizar y explorar propiedades.

## Requisitos

- [ ] Visualización de propiedades en un mapa.
- [ ] Marcadores con precios.
- [ ] Apertura de ficha desde el marcador.
- [ ] Sincronización entre mapa y resultados.
- [ ] Filtro por zona geográfica.
- [ ] Geolocalización de propiedades.
- [ ] Agrupación de marcadores cuando hay muchas propiedades.
- [ ] Visualización aproximada cuando no se dispone de coordenadas exactas.

## Notas

- El frontend define un puerto de mapa (marcadores, clustering, selección de zona, eventos de movimiento); MapLibre GL es su primera implementación ([D9](/es/adr/d09-map/), [D10](/es/adr/d10-cross-cutting-architecture/)).
- Criterios de aceptación y dependencias: por definir en la especificación funcional detallada.
