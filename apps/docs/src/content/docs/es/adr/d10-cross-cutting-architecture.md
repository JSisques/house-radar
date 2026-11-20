---
title: "D10. Arquitectura transversal"
description: "DDD con puertos y adaptadores tanto en backend como en frontend. Toda librería externa (ORM, colas, mapa, gráficas, HTTP) se accede mediante"
sidebar:
  order: 11
---

- **Estado:** Aceptada
- **Fecha:** 2026-11-20

## Contexto

Backend y frontend dependen de librerías externas que podrían necesitar sustituirse.

## Decisión

DDD con puertos y adaptadores tanto en backend como en frontend. Toda librería externa (ORM, colas, mapa, gráficas, HTTP) se accede mediante un adaptador.

## Consecuencias

- El frontend define un puerto de mapa (marcadores, clustering, selección de zona, eventos de movimiento) y MapLibre es su primera implementación.
- Los componentes de UI dependen del puerto, no de MapLibre ni de `react-map-gl`.
- Cambiar de proveedor de mapas (Leaflet, Google Maps, Mapbox) implica escribir un nuevo adaptador, sin modificar dominio ni componentes.
- El mismo criterio aplica al resto de dependencias externas en ambos lados.

Las consecuencias se comparten con [D9](/es/adr/d09-map/).
