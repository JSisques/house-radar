---
title: Lenguaje ubicuo y modelo de datos
description: Conceptos centrales del dominio. Propiedad frente a anuncio, procedencia, valores desconocidos y tipos de dato.
sidebar:
  order: 1
---

Todos los anuncios se convierten a un modelo común, independientemente de su procedencia. Esta página define los términos utilizados en la documentación.

## Propiedad frente a anuncio

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

## Histórico de precios

El histórico de precios es una funcionalidad central (P0). Registra snapshots de los anuncios, cambios de precio, cambios relevantes de características y anuncios desaparecidos.

El histórico refleja **únicamente lo que House Radar ha observado** desde que comenzó a recopilar un anuncio. No debe presentarse como un historial completo anterior a la primera observación.

## Advertencia sobre estadísticas

Las estadísticas deben indicar el tamaño y la procedencia de la muestra. Los precios anunciados no equivalen necesariamente a los precios reales de compraventa.

## Modelo compartido

El modelo de dominio normalizado se comparte como paquete interno, `packages/domain`, tipado de punta a punta ([D1 y D2](/es/adr/d02-repository-strategy/)).
