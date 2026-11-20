---
title: "D19. Modelo de lectura de la búsqueda"
description: "Los resultados de búsqueda son propiedades, no anuncios. El precio representativo es el menor entre los anuncios activos de la propiedad."
sidebar:
  order: 20
---

- **Estado:** Aceptada
- **Fecha:** 2026-11-20

## Contexto

Una propiedad puede tener varios anuncios con precios distintos en diferentes fuentes ([D3](/es/adr/d03-source-strategy/)). El buscador, el mapa y el dashboard deben decidir qué es un resultado y qué precio muestra.

## Decisión

Los resultados de búsqueda son propiedades, no anuncios. El precio representativo de una propiedad es el menor precio entre sus anuncios activos. Los resultados se presentan como «N anuncios, desde X €» y la ficha de la propiedad lista cada anuncio con su fuente y su precio.

## Consecuencias

- Una propiedad que aparece en varios portales se devuelve una sola vez, de modo que los recuentos y estadísticas no se inflan con duplicados.
- Los filtros de precio, la ordenación por precio y el precio por metro cuadrado usan el precio representativo ([D20](/es/adr/d20-listing-consolidation-rules/)).
- Una propiedad sin anuncios activos no tiene precio representativo; se excluye de los filtros de precio y de las estadísticas.
- El modelo de lectura es un dato derivado. Debe mantenerse coherente cuando se añade un anuncio, cambia de precio, desaparece o se vincula a otra propiedad ([D21](/es/adr/d21-duplicate-detection-policy/)).

## Alternativas consideradas

- **Anuncios como resultados:** cada anuncio es un resultado. Descartada porque multiplica la misma vivienda en los resultados y las estadísticas y contradice la distinción entre propiedad y anuncio (principio de producto 2).
