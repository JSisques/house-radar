---
title: "D3. Estrategia de fuentes"
description: "Primera fuente objetivo: idealista Search API (oficial, acceso bajo solicitud). Fuente provisional del MVP: importación manual por URL. Segu"
sidebar:
  order: 4
---

- **Estado:** Aceptada
- **Fecha:** 2026-11-20

## Contexto

House Radar debe ingerir anuncios únicamente por medios autorizados (principio de producto 7).

## Decisión

Primera fuente objetivo: idealista Search API (oficial, acceso bajo solicitud). Fuente provisional del MVP: importación manual por URL. Segunda fuente candidata: feeds autorizados de inmobiliarias locales de Santiago.

## Consecuencias

- Se solicita la API key de la idealista Search API (<https://developers.idealista.com/access-request>). La aprobación no es automática y las condiciones de uso (cuotas, almacenamiento, redistribución) se conocerán al recibirla.
- Hasta entonces, la importación manual por URL desbloquea el desarrollo de normalización, buscador, fichas e histórico.
- El conector de idealista se diseña contra el contrato de la API oficial y se implementa al obtener acceso y validar que sus condiciones permiten almacenar snapshots e histórico propio.

## Alternativas consideradas

- Fotocasa, Habitaclia y pisos.com: no ofrecen API pública conocida; se descarta el scraping no autorizado (principio de producto 7).
