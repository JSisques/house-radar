---
title: "D17. Importación manual como formulario asistido"
description: "La importación manual es un formulario asistido: la URL se guarda como procedencia y los datos se introducen a mano. No se extrae contenido de la página."
sidebar:
  order: 18
---

- **Estado:** Aceptada
- **Fecha:** 2026-11-20

## Contexto

[D3](/es/adr/d03-source-strategy/) establece la importación manual por URL como fuente provisional del MVP mientras se espera la API key de idealista. Descargar y analizar la página de un portal sería scraping no autorizado (principio de producto 7), por lo que la importación no puede depender de leer el contenido tras la URL.

## Decisión

La importación manual es un formulario asistido. El usuario pega la URL del anuncio original, que se guarda como procedencia y como enlace al original, e introduce a mano todos los datos. House Radar no descarga, analiza ni extrae ningún contenido de la página que hay tras la URL. Las actualizaciones de precio de los anuncios importados manualmente también son manuales.

## Consecuencias

- La URL es solo procedencia: fuente, enlace original e identificador externo cuando el usuario puede aportarlo. Nunca se descarga.
- El formulario alimenta el mismo proceso de normalización que cualquier otro conector ([HR-F002](/es/features/hr-f002-normalization/)), de modo que todo dato importado manualmente se marca como declarado por el usuario.
- Los anuncios manuales no tienen comprobaciones automáticas de estado. El usuario registra nuevas observaciones con la acción «comprobar anuncio» y marca los anuncios como desaparecidos ([D20](/es/adr/d20-listing-consolidation-rules/)).
- No se requiere revisión legal de las condiciones de ningún portal para esta fuente, porque no se accede a contenido de portales.
- El esfuerzo de introducción de datos recae en el usuario; el formulario debe mantener al mínimo los campos obligatorios y admitir valores desconocidos.

## Alternativas consideradas

- **URL más texto pegado analizado localmente:** el usuario pega el texto del anuncio y House Radar extrae los campos. Descartada para el MVP: el análisis es frágil, cada portal formatea el texto de forma distinta y añade un componente de extracción que sería sustituido por el conector oficial. Sigue siendo una posible mejora posterior.
