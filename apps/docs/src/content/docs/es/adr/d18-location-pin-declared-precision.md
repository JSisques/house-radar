---
title: "D18. Ubicación como pin con precisión declarada"
description: "La ubicación es un pin en un mapa con precisión declarada; municipio y provincia se derivan de límites oficiales y la geocodificación se aplaza."
sidebar:
  order: 19
---

- **Estado:** Aceptada
- **Fecha:** 2026-11-20

## Contexto

El buscador, el mapa y las estadísticas por municipio necesitan una ubicación para cada propiedad. Los anuncios importados manualmente ([D17](/es/adr/d17-manual-import-assisted-form/)) no tienen coordenadas y muchos portales solo publican ubicaciones aproximadas. Geocodificar direcciones requiere un servicio externo cuyas condiciones y coste no se han evaluado.

## Decisión

La ubicación de una propiedad es un pin colocado en un mapa con una precisión declarada: `exact` (exacta), `approximate` (aproximada) o `municipality` (municipio). El municipio y la provincia se derivan del pin mediante una consulta PostGIS de punto en polígono contra los límites abiertos oficiales del IGN (Instituto Geográfico Nacional). El código postal se introduce a mano. La geocodificación se aplaza: cuando se necesite será un nuevo adaptador tras un puerto ([D10](/es/adr/d10-cross-cutting-architecture/)).

## Consecuencias

- Cada propiedad tiene como máximo una ubicación, formada por coordenadas más precisión. Una propiedad sin pin tiene ubicación desconocida.
- Los límites administrativos se cargan en PostGIS ([D6](/es/adr/d06-persistence/)) y son datos de referencia, no datos del usuario.
- El mapa ([HR-F006](/es/features/hr-f006-map/)) muestra la precisión declarada y nunca presenta un pin aproximado como exacto.
- Los filtros de comunidad autónoma, provincia y municipio se basan en los valores derivados, por lo que son coherentes con independencia de la fuente.
- El código postal es un dato declarado y no se valida contra el pin.

## Alternativas consideradas

- **Geocodificar la dirección:** descartada para el MVP porque depende de un servicio externo con condiciones y cuotas desconocidas, y no ayudaría con anuncios manuales cuya dirección es parcial.
- **Ambas (geocodificación con pin manual como alternativa):** descartada para el MVP para mantener un único mecanismo de ubicación; puede añadirse más adelante como adaptador sin cambiar el modelo.
