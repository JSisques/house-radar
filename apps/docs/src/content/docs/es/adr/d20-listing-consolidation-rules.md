---
title: "D20. Reglas de consolidación de anuncios"
description: "Reglas para consolidar anuncios en una propiedad: conflictos, histórico de precios, observaciones, desaparición, precio por metro cuadrado y estadísticas."
sidebar:
  order: 21
---

- **Estado:** Aceptada
- **Fecha:** 2026-11-20

## Contexto

Una propiedad agrega los datos de uno o varios anuncios ([D19](/es/adr/d19-search-read-model/)). Sin reglas explícitas, una misma propiedad podría mostrar valores contradictorios, un histórico de precios engañoso o estadísticas poco fiables.

## Decisión

1. **Atributos en conflicto:** cuando los anuncios discrepan en un atributo, la propiedad muestra el valor observado más reciente y señala el conflicto, mostrando cada valor con su fuente.
2. **Histórico de precios:** se almacena por anuncio. La propiedad muestra la evolución de su menor precio activo.
3. **Comprobación manual:** la acción «comprobar anuncio» registra una nueva observación: precio (haya cambiado o no), estado de actividad y fecha de comprobación.
4. **Anuncios desaparecidos:** en las fuentes manuales, el usuario marca el anuncio como desaparecido. En las fuentes automáticas, un anuncio está desaparecido cuando no se ha visto en N ejecuciones consecutivas; N es configurable y vale 3 por defecto.
5. **Precio por metro cuadrado:** usa únicamente la superficie construida. Si falta la superficie construida, el valor es desconocido y nunca se recurre silenciosamente a la superficie útil.
6. **Estadísticas:** se calculan sobre propiedades activas y siempre indican el tamaño de la muestra y su procedencia.

## Consecuencias

- Todo cambio en un anuncio es una observación con fecha y fuente, que es lo que da sentido al histórico (principio de producto 3).
- La propiedad nunca oculta un desacuerdo entre fuentes; el conflicto es un dato que el usuario puede inspeccionar.
- El histórico solo refleja lo que House Radar ha observado, nunca un pasado completo.
- El umbral de desaparición N es configuración, no código.
- Las propiedades sin superficie construida se excluyen de las estadísticas y filtros de precio por metro cuadrado, y la exclusión es visible en el tamaño de la muestra.

## Alternativas consideradas

- **Propiedad con una única fuente «ganadora»:** descartada porque oculta los conflictos y hace que el resultado dependa de una prioridad arbitraria entre fuentes.
- **Recurrir a la superficie útil para el precio por metro cuadrado:** descartada porque mezcla dos medidas distintas y distorsionaría silenciosamente las comparaciones.
