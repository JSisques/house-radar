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

El sistema sugiere candidatos a duplicado y nunca fusiona automáticamente. Un par de anuncios es candidato cuando se cumplen todas estas condiciones:

- sus ubicaciones son cercanas: la distancia entre ellas es inferior a 100 m cuando ambas ubicaciones tienen precisión `exact`; cuando la precisión de alguna de las ubicaciones no es `exact`, el criterio de 100 m se sustituye por «mismo municipio»;
- sus superficies construidas difieren como máximo un 5 %; y
- tienen el mismo número de habitaciones.

La misma fuente y el mismo identificador externo no es un candidato a duplicado: es el mismo anuncio y la ingesta lo actualiza (ingesta idempotente).

Los umbrales (100 m, 5 %) son configurables. El usuario resuelve cada candidato como «misma propiedad» (los anuncios se vinculan a una única propiedad) o «propiedad distinta» (el candidato se descarta y la decisión se recuerda, de modo que el par no vuelve a sugerirse).

## Consecuencias

- La detección de candidatos es un mecanismo de sugerencia; todo vínculo entre anuncios procede de una acción explícita del usuario.
- Los pares descartados se persisten, de modo que la detección es idempotente y no resulta molesta.
- Los anuncios sin ubicación, superficie construida o habitaciones no pueden ser candidatos; los valores desconocidos nunca cuentan como coincidencia (principio de producto 4).
- Los candidatos a duplicado solo surgen entre anuncios distintos; una fuente e identificador externo repetidos nunca llegan a la detección porque la ingesta actualiza el anuncio existente.
- Un pin con precisión `approximate` o `municipality` no permite comparar distancias, por lo que el criterio de ubicación recurre al municipio derivado del pin ([D18](/es/adr/d18-location-pin-declared-precision/)).
- Vincular o desvincular anuncios cambia el modelo de lectura ([D19](/es/adr/d19-search-read-model/)) y la consolidación de atributos e histórico ([D20](/es/adr/d20-listing-consolidation-rules/)).

## Enmienda (2026-11-20)

Una revisión de las especificaciones funcionales encontró dos defectos en los criterios originales, que se corrigen aquí:

- **La misma fuente y el mismo identificador externo no es un candidato a duplicado.** La decisión original lo incluía como criterio de candidato, pero la misma fuente y el mismo identificador externo identifican un único anuncio ([HR-F001](/es/features/hr-f001-ingestion/)): la ingesta lo actualiza y nunca crea un segundo, por lo que no hay ningún par que comparar. El criterio se elimina.
- **Una distancia inferior a 100 m carece de sentido con ubicaciones imprecisas.** La decisión original aplicaba el criterio de 100 m a cualquier pin, pero los pines con precisión `approximate` o `municipality` no sitúan la vivienda con esa exactitud. Cuando la precisión de alguna de las ubicaciones no es `exact`, el criterio de 100 m se sustituye por «mismo municipio»; los criterios de superficie construida (±5 %) y de habitaciones se mantienen.

## Alternativas consideradas

- **Fusión automática por encima de un umbral de confianza:** descartada para la primera versión porque una fusión errónea es costosa y el volumen es lo bastante pequeño para la revisión manual.
