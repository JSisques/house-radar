---
title: "D9. Mapa"
description: "MapLibre GL (`react-map-gl`) detrás de un adaptador, sustituible sin afectar al resto."
sidebar:
  order: 10
---

- **Estado:** Aceptada
- **Fecha:** 2026-11-20

## Contexto

El mapa es una funcionalidad P1 de experiencia de usuario y su proveedor podría cambiar.

## Decisión

MapLibre GL (`react-map-gl`) detrás de un adaptador, sustituible sin afectar al resto.

## Consecuencias

- El frontend define un puerto de mapa (marcadores, clustering, selección de zona, eventos de movimiento) y MapLibre es su primera implementación.
- Los componentes de UI dependen del puerto, no de MapLibre ni de `react-map-gl`.
- Cambiar de proveedor de mapas (Leaflet, Google Maps, Mapbox) implica escribir un nuevo adaptador, sin modificar dominio ni componentes.
- El mismo criterio aplica al resto de dependencias externas en ambos lados.

Las consecuencias se comparten con [D10](/es/adr/d10-cross-cutting-architecture/).
