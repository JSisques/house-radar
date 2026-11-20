---
title: "D25. CQRS y estructura de contextos"
description: "El backend usa CQRS con @nestjs/cqrs y una estructura por contexto con capas de dominio, aplicación, infraestructura y transporte."
sidebar:
  order: 26
---

- **Estado:** Aceptada
- **Fecha:** 2026-11-20

## Contexto

El backend se organiza por bounded contexts ([D4](/es/adr/d04-backend-framework/)) con puertos y adaptadores ([D10](/es/adr/d10-cross-cutting-architecture/)). Hace falta una forma uniforme de expresar el comportamiento de la aplicación, una estructura de carpetas predecible y una regla sobre cómo se comunican los contextos. Además, la búsqueda se sirve desde un modelo de lectura ([D19](/es/adr/d19-search-read-model/)), de modo que lecturas y escrituras tienen formas distintas.

## Decisión

- El comportamiento de la aplicación se expresa como comandos y consultas gestionados con `@nestjs/cqrs`. Cada comando o consulta tiene su propia carpeta con el mensaje, su handler y su spec, por ejemplo `commands/import-manual-listing/` y `queries/property-find-by-id/`.
- Cada contexto vive en `src/contexts/<context>/{domain,application,infrastructure,transport}`. `src/core/` contiene la infraestructura de toda la aplicación y `src/shared/` las piezas de Nest compartidas entre contextos.
- Las dependencias apuntan hacia dentro. `transport` solo usa `CommandBus` y `QueryBus`; los handlers solo usan repositorios y servicios.
- Los contextos se comunican mediante puertos en `application/ports/`, implementados por adaptadores en `infrastructure/adapters/`, o mediante eventos de dominio consumidos por handlers de eventos y proyecciones.
- El código entrante es solo REST ([D22](/es/adr/d22-api-style/)).

Los detalles están en [Convenciones de código](/es/architecture/conventions/).

## Consecuencias

- Una única estructura de archivos para cada operación: un nuevo caso de uso es una nueva carpeta, y la screaming architecture muestra lo que hace el sistema.
- Los caminos de lectura y escritura pueden evolucionar por separado, lo que encaja con el modelo de lectura de la búsqueda.
- Los eventos de dominio tienen consumidores de primera clase en lugar de ser un efecto secundario.
- Las reglas de dependencias se pueden comprobar con ESLint ([D16](/es/adr/d16-quality-and-workflow/)).
- Más archivos por funcionalidad que con una única clase de servicio.
- El agregado no extiende el `AggregateRoot` del framework, así que los handlers de comandos publican los eventos que registró ([D24](/es/adr/d24-own-building-blocks/)).
- Sustituida en parte por [D31](/es/adr/d31-transactional-outbox/): los handlers ya no publican eventos mediante el `EventBus`; el repositorio de escritura los persiste en un outbox en la misma transacción que el agregado.

## Alternativas consideradas

- **Casos de uso simples con carpetas de comandos y consultas, sin bus:** la misma estructura con los handlers inyectados directamente. Más simple, y `application` no dependería de `@nestjs/cqrs`. Descartada porque los buses desacoplan el transporte de los handlers y dan un único lugar para el comportamiento transversal, con poca complejidad añadida dentro del ecosistema NestJS.
