---
title: "D26. TanStack Router"
description: "apps/web usa TanStack Router, con los parámetros de búsqueda tipados y validados con zod en la definición de la ruta."
sidebar:
  order: 27
---

- **Estado:** Aceptada
- **Fecha:** 2026-11-20

## Contexto

`apps/web` ([D5](/es/adr/d05-frontend-framework/)) es una SPA cuyo estado de búsqueda vive en la URL, con unos veinte filtros (HR-F003-BR11). La API se consume mediante un cliente tipado ([D22](/es/adr/d22-api-style/)) y los datos del servidor se cachean con TanStack Query. El router debe tipar y validar la URL, porque la URL es el estado de la búsqueda.

## Decisión

Usar TanStack Router.

- Los parámetros de búsqueda se declaran en la definición de la ruta y se validan con zod; los valores inválidos vuelven a los valores por defecto.
- La navegación es segura a nivel de tipos: un enlace a una ruta inexistente o con parámetros erróneos es un error de compilación.
- Las rutas se integran con TanStack Query para cargar datos.

Los detalles están en [Convenciones de código](/es/architecture/conventions/).

## Consecuencias

- Los filtros están tipados desde la URL hasta el caso de uso, con los valores por defecto gestionados en un único lugar.
- Los enlaces rotos se detectan en compilación.
- La comunidad del router es menor que la de React Router, y su tooling basado en archivos añade un paso de build.
- El router vive en la capa de presentación; los casos de uso no dependen de él ([D10](/es/adr/d10-cross-cutting-architecture/)).

## Alternativas consideradas

- **React Router v7:** la opción más extendida y con una API conocida. Descartada porque los parámetros de búsqueda son cadenas simples que habría que tipar y validar a mano, y los enlaces no se comprueban en compilación.
