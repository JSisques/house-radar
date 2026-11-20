---
title: Estrategia de fuentes
description: Qué fuentes persigue House Radar, en qué orden y las consideraciones legales.
sidebar:
  order: 1
---

Las decisiones [D3](/es/adr/d03-source-strategy/) y [D37](/es/adr/d37-fotocasa-detail-connector/) definen la estrategia de fuentes.

## Orden de las fuentes

1. **Primer conector automático:** páginas de detalle de Fotocasa ([D37](/es/adr/d37-fotocasa-detail-connector/)).
2. **Opcional:** idealista Search API (oficial, acceso bajo solicitud), si algún día se concede la clave.
3. **Fuente provisional del MVP:** importación manual por URL.
4. **Candidata:** feeds autorizados de inmobiliarias locales de Santiago.
5. **Descubrimiento de anuncios nuevos:** pendiente de una decisión posterior (alertas de correo del portal, feeds de inmobiliarias o la API de idealista).

## Páginas de detalle de Fotocasa

Fotocasa no ofrece API pública. El conector lee únicamente páginas de anuncios individuales: la única página de una URL que pega el usuario y las páginas de los anuncios que el usuario ya sigue (aproximadamente una vez al día, una a una). Respeta `robots.txt`, se detiene ante cualquier CAPTCHA o bloqueo, nunca descarga imágenes, nunca solicita páginas de búsqueda o listado, es de uso privado y está deshabilitado en producción. Ver [D37](/es/adr/d37-fotocasa-detail-connector/).

## idealista Search API (opcional)

La API key se solicita mediante el [formulario de solicitud de acceso de idealista](https://developers.idealista.com/access-request).

- La aprobación no es automática.
- Las condiciones de uso (cuotas, almacenamiento, redistribución) se conocerán al recibir la clave.
- El conector de idealista se diseña contra el contrato de la API oficial. Se implementa al obtener acceso y validar que sus condiciones permiten almacenar snapshots e histórico propio.

## Importación manual por URL

Hasta que se obtenga acceso a la API, la importación manual por URL desbloquea el desarrollo de la normalización, el buscador, las fichas y el histórico de precios.

## Otras fuentes sin API pública conocida

Habitaclia y pisos.com no ofrecen API pública conocida. Se descarta el scraping no autorizado (principio de producto 7). También se rechaza rastrear las páginas de búsqueda o listado de Fotocasa: contradice su `robots.txt`.

## Consideración legal y operativa

Antes de implementar un conector hay que revisar las condiciones de uso de la fuente, sus APIs, feeds y permisos. No se debe asumir que la extracción automatizada está permitida. Cuando no exista autorización, se pueden utilizar importaciones manuales, enlaces u otras fuentes permitidas.
