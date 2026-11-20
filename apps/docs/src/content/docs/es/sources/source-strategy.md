---
title: Estrategia de fuentes
description: Qué fuentes persigue House Radar, en qué orden y las consideraciones legales.
sidebar:
  order: 1
---

La decisión [D3](/es/adr/d03-source-strategy/) define la estrategia de fuentes.

## Orden de las fuentes

1. **Primera fuente objetivo:** idealista Search API (oficial, acceso bajo solicitud).
2. **Fuente provisional del MVP:** importación manual por URL.
3. **Segunda fuente candidata:** feeds autorizados de inmobiliarias locales de Santiago.

## idealista Search API

La API key se solicita mediante el [formulario de solicitud de acceso de idealista](https://developers.idealista.com/access-request).

- La aprobación no es automática.
- Las condiciones de uso (cuotas, almacenamiento, redistribución) se conocerán al recibir la clave.
- El conector de idealista se diseña contra el contrato de la API oficial. Se implementa al obtener acceso y validar que sus condiciones permiten almacenar snapshots e histórico propio.

## Importación manual por URL

Hasta que se obtenga acceso a la API, la importación manual por URL desbloquea el desarrollo de la normalización, el buscador, las fichas y el histórico de precios.

## Fuentes sin API pública conocida

Fotocasa, Habitaclia y pisos.com no ofrecen API pública conocida. Se descarta el scraping no autorizado (principio de producto 7).

## Consideración legal y operativa

Antes de implementar un conector hay que revisar las condiciones de uso de la fuente, sus APIs, feeds y permisos. No se debe asumir que la extracción automatizada está permitida. Cuando no exista autorización, se pueden utilizar importaciones manuales, enlaces u otras fuentes permitidas.
