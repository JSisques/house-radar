---
title: Lenguaje ubicuo y modelo de datos
description: Conceptos centrales del dominio. Propiedad frente a anuncio, procedencia, valores desconocidos y tipos de dato.
sidebar:
  order: 1
---

Todos los anuncios se convierten a un modelo común, independientemente de su procedencia. Esta página define los términos utilizados en la documentación.

## Propiedad frente a anuncio

> Contextos, agregados y tablas construidos sobre estos términos: [Mapa de contextos](/es/architecture/context-map/), [Agregados](/es/domain/aggregates/), [Esquema de base de datos](/es/architecture/database-schema/).

- **Propiedad**: el inmueble real.
- **Anuncio**: la publicación sobre una propiedad en una fuente (portal) determinada.

Un mismo inmueble puede tener varios anuncios en diferentes portales. House Radar debe diferenciar entre el inmueble real y los anuncios publicados sobre él (principio de producto 2). En la detección de duplicados se vinculan varios anuncios a una misma propiedad; las coincidencias probables se señalan para revisión manual y nunca se fusionan automáticamente dos viviendas distintas.

## Procedencia

Cada dato debe poder relacionarse con su fuente y fecha de observación (principio de producto 3). Un anuncio registra:

- Portal de origen.
- URL original.
- Identificador externo (único en su fuente).
- Fecha de publicación, si se conoce.
- Fecha de incorporación a House Radar.
- Fecha de última comprobación.
- Estado del anuncio: `active` (activo), `disappeared` (desaparecido) o `unknown` (desconocido).

## Valores desconocidos

Los campos deben admitir valores desconocidos. La ausencia de un dato en el anuncio no significa que la propiedad carezca de esa característica. Los valores desconocidos siguen siendo desconocidos y no se infieren características sin indicarlo (principio de producto 4).

## Datos declarados, calculados e inferidos

El modelo distingue entre:

| Tipo | Significado |
| --- | --- |
| Declarado | Indicado por el anunciante en el anuncio. |
| Calculado | Derivado de forma determinista a partir de otros datos (por ejemplo, el precio por metro cuadrado cuando puede calcularse). |
| Inferido | Estimado a partir de indicios indirectos; siempre debe marcarse como tal. |

## Campos normalizados

### Información general

Título del anuncio, descripción, precio, superficie construida, superficie útil, superficie de terreno, número de habitaciones, número de baños, tipo de propiedad, estado de conservación y año de construcción cuando esté disponible.

### Características adicionales

Garaje, jardín, piscina, terraza, balcón, calefacción, ascensor, certificado energético, tipo de suelo, agua, electricidad y saneamiento.

## Observación

Una **observación** es un registro fechado de lo que House Radar vio sobre un anuncio en un momento dado: precio, si el anuncio seguía activo y fecha de comprobación. Las observaciones las crean las ejecuciones automáticas o la acción manual «comprobar anuncio» ([D20](/es/adr/d20-listing-consolidation-rules/)). El histórico de precios se construye a partir de observaciones.

## Ciclo de vida del estado del anuncio

Un anuncio se encuentra en uno de tres estados:

| Estado | Significado |
| --- | --- |
| `active` | Visto como disponible en su última observación. |
| `disappeared` | Ya no está disponible: lo marca el usuario (fuentes manuales) o no se ha visto en N ejecuciones consecutivas (fuentes automáticas; N es configurable, 3 por defecto). |
| `unknown` | No hay evidencia suficiente para decirlo, por ejemplo antes de la primera comprobación. |

Solo los anuncios `active` contribuyen al precio representativo y a las estadísticas.

## Precisión de la ubicación

La ubicación de una propiedad es un pin en un mapa con una precisión declarada ([D18](/es/adr/d18-location-pin-declared-precision/)):

| Precisión | Significado |
| --- | --- |
| `exact` | El pin marca la propiedad en sí. |
| `approximate` | El pin está cerca de la propiedad, pero no sobre ella. |
| `municipality` | El pin solo identifica el municipio. |

El municipio y la provincia se derivan del pin contra los límites oficiales del IGN. El código postal se introduce a mano.

## Precio representativo

El **precio representativo** de una propiedad es el menor precio entre sus anuncios `active`. Los resultados de búsqueda lo muestran como «N anuncios, desde X €» ([D19](/es/adr/d19-search-read-model/)). Una propiedad sin anuncios activos no tiene precio representativo.

## Conflicto de atributos

Un **conflicto de atributos** aparece cuando los anuncios de una propiedad discrepan en un atributo. La propiedad muestra el valor observado más reciente, señala el conflicto y muestra cada valor con su fuente ([D20](/es/adr/d20-listing-consolidation-rules/)).

## Candidato a duplicado y resolución

Un **candidato a duplicado** es un par de anuncios que el sistema sugiere que podrían pertenecer a la misma propiedad. Un par es candidato cuando las ubicaciones son cercanas (distancia inferior a 100 m cuando ambas tienen precisión `exact`; el mismo municipio cuando alguna precisión no es `exact`), las superficies construidas difieren como máximo un 5 % y el número de habitaciones es el mismo (umbrales configurables). La misma fuente e identificador externo no es un candidato: es el mismo anuncio y la ingesta lo actualiza. El sistema nunca fusiona automáticamente. El usuario resuelve cada candidato como **misma propiedad** (vínculo) o **propiedad distinta** (descarte, que se recuerda) ([D21](/es/adr/d21-duplicate-detection-policy/)).

## Histórico de precios

El histórico de precios es una funcionalidad central (P0). Registra snapshots de los anuncios, cambios de precio, cambios relevantes de características y anuncios desaparecidos.

El histórico refleja **únicamente lo que House Radar ha observado** desde que comenzó a recopilar un anuncio. No debe presentarse como un historial completo anterior a la primera observación.

## Advertencia sobre estadísticas

Las estadísticas deben indicar el tamaño y la procedencia de la muestra. Los precios anunciados no equivalen necesariamente a los precios reales de compraventa.

## Modelo compartido

El modelo de dominio normalizado se comparte como paquete interno, `packages/shared-kernel`, tipado de punta a punta ([D1 y D2](/es/adr/d02-repository-strategy/)).
