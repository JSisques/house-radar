---
title: "D21. Política de detección de duplicados"
description: "El sistema sugiere candidatos a duplicado y nunca fusiona automáticamente; el usuario resuelve cada uno. Los umbrales son configurables."
sidebar:
  order: 22
---

- **Estado:** Aceptada
- **Fecha:** 2026-11-20

## Contexto

Una misma vivienda puede anunciarse en varias fuentes y House Radar debe diferenciar el inmueble real de sus anuncios (principio de producto 2). Fusionar por error dos viviendas distintas corrompe el histórico y las estadísticas y es difícil de deshacer.

## Decisión

El sistema sugiere candidatos a duplicado y nunca fusiona automáticamente. Un par de anuncios es candidato cuando se cumple alguna de estas condiciones:

- tienen la misma fuente y el mismo identificador externo; o
- la distancia entre sus ubicaciones es inferior a 100 m, sus superficies construidas difieren como máximo un 5 % y tienen el mismo número de habitaciones.

Los umbrales (100 m, 5 %) son configurables. El usuario resuelve cada candidato como «misma propiedad» (los anuncios se vinculan a una única propiedad) o «propiedad distinta» (el candidato se descarta y la decisión se recuerda, de modo que el par no vuelve a sugerirse).

## Consecuencias

- La detección de candidatos es un mecanismo de sugerencia; todo vínculo entre anuncios procede de una acción explícita del usuario.
- Los pares descartados se persisten, de modo que la detección es idempotente y no resulta molesta.
- Los anuncios sin ubicación, superficie construida o habitaciones no pueden coincidir por el segundo criterio; los valores desconocidos nunca cuentan como coincidencia (principio de producto 4).
- Vincular o desvincular anuncios cambia el modelo de lectura ([D19](/es/adr/d19-search-read-model/)) y la consolidación de atributos e histórico ([D20](/es/adr/d20-listing-consolidation-rules/)).

## Alternativas consideradas

- **Fusión automática por encima de un umbral de confianza:** descartada para la primera versión porque una fusión errónea es costosa y el volumen es lo bastante pequeño para la revisión manual.
