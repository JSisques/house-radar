---
title: "D36. Alojamiento de la documentación en Cloudflare Pages"
description: "El portal de documentación se publica en Cloudflare Pages en la raíz de su dominio pages.dev, con un despliegue en cada merge a main y una previsualización por pull request."
sidebar:
  order: 37
---

- **Estado:** Aceptada
- **Fecha:** 2026-11-20

## Contexto

El portal de documentación ([D11](/es/adr/d11-documentation-portal/)) es público. Su contenido tiene 858 enlaces internos absolutos desde la raíz (por ejemplo `/adr/d33-versioning-and-releases/`). Alojarlo bajo un subpath los rompería: con GitHub Pages en `jsisques.github.io/house-radar/` el sitio necesitaría `base: '/house-radar'`, que Starlight aplica a su navegación pero no a los enlaces escritos en el contenido.

## Decisión

- El portal se aloja en **Cloudflare Pages** y se sirve en la raíz de `<proyecto>.pages.dev`. El nombre del proyecto se confirma al crear el proyecto de Cloudflare; más adelante se puede añadir un dominio propio sin cambios.
- Cada merge a `main` publica el portal y cada pull request obtiene una previsualización, de modo que los cambios de documentación se revisan ya publicados.
- Cuando exista la URL, se configura como `site` de Astro (lo que elimina el aviso del sitemap) y como página principal del repositorio.

## Consecuencias

- Los 858 enlaces absolutos desde la raíz siguen funcionando sin reescribir contenido.
- No hace falta comprar un dominio ahora y se puede asociar uno después.
- Los pull requests obtienen una previsualización publicada de los cambios de documentación.
- Añade una dependencia de un servicio de alojamiento de terceros y un proyecto de Cloudflare que mantener.

## Alternativas consideradas

- **GitHub Pages bajo un subpath:** los 858 enlaces absolutos desde la raíz se romperían. Descartada.
- **GitHub Pages con dominio propio:** exige comprar un dominio ya. Descartada.
