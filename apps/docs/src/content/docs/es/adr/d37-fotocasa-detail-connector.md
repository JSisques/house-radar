---
title: "D37. Conector de páginas de detalle de Fotocasa"
description: "Un conector que lee páginas individuales de anuncios de Fotocasa, al importar por el usuario y para refrescar anuncios seguidos, solo para uso privado y deshabilitado en producción."
sidebar:
  order: 38
---

- **Estado:** Aceptada
- **Fecha:** 2026-11-20

## Contexto

[D3](/es/adr/d03-source-strategy/) descartó el scraping no autorizado (principio de producto 7) y [D17](/es/adr/d17-manual-import-assisted-form/) definió la importación manual como un formulario asistido en el que no se lee nada de la página del portal. La evidencia reunida el 2026-11-20 sobre Fotocasa es:

- **Sin API para terceros.** Adevinta / Fotocasa no ofrece una API pública ni un canal de datos para leer anuncios. La integración oficial es para inmobiliarias que publican en Fotocasa, no para leer.
- **`robots.txt` (`User-agent: *`).** Las páginas de búsqueda y de listado y su paginación están prohibidas (`/buscar/`, `/search/`, `/*/listado`, `/*/list`, `/*/l/2*` a `/*/l/39*`), así como todos los parámetros de filtro (`minPrice`, `maxPrice`, `minRooms`, `filter`, `latitude`, `pagination`, `combinedLocationIds` y otros) y las APIs internas (`/mvc/`, `/ws/`). Las páginas de anuncios individuales (`/es/comprar/vivienda/…/<id>/d`) no están prohibidas. No hay `Crawl-delay`.
- **Aviso legal** (`/es/aviso-legal/ln`, apartado 3, la parte leída literalmente). El uso se permite «únicamente para sus propias necesidades», sin explotación comercial. El aviso indica: «queda terminantemente prohibido la utilización de los textos, imágenes, anuncios … para su posterior inclusión … en otros sitios web ajenos a la Empresa sin contar con la autorización previa y por escrito». Además exige a los usuarios «abstenerse de eludir o manipular cualesquiera dispositivos técnicos». La parte leída literalmente no menciona el scraping de forma explícita.

## Decisión

Construir un **conector de páginas de detalle de Fotocasa**, limitado a lo que el portal publica como permitido:

1. **Importación con extracción.** El usuario pega la URL de un anuncio (como en D17) y el sistema lee **esa única página** para rellenar de antemano el formulario asistido. El usuario lo revisa y confirma.
2. **Refresco de anuncios seguidos.** Los anuncios ya importados se vuelven a leer desde **su propia página** a baja frecuencia (por defecto una vez al día, uno a uno) para registrar observaciones (precio, sigue publicado) en el histórico.
3. **Reglas estrictas.** `robots.txt` se lee y se respeta antes de cada petición; el conector envía un User-Agent identificable; ante un CAPTCHA, un bloqueo o cualquier dispositivo anti-bot el conector **se detiene** y lo notifica, y nunca lo elude (el aviso legal prohíbe la elusión); las imágenes no se descargan, solo se enlazan; no se solicita ninguna página de búsqueda, listado o paginación.
4. **Solo uso privado.** El conector está habilitado en local y en staging (privado, accesible solo por Tailscale, [D35](/es/adr/d35-environments-and-staging-deployment/)) y **deshabilitado en producción**. Mostrar estos datos a terceros requiere autorización escrita de Fotocasa.
5. **Adaptador aislado.** Se implementa como un adaptador de conector tras el puerto de ingesta ([D10](/es/adr/d10-cross-cutting-architecture/), [D23](/es/adr/d23-ingestion-concurrency-model/)), de modo que un cambio en las condiciones de Fotocasa o un bloqueo permita desactivarlo sin afectar a nada más.

El **descubrimiento** automático de anuncios nuevos queda aplazado a una decisión posterior.

## Consecuencias

- Todavía no hay descubrimiento automático: los anuncios entran solo mediante las URL que pega el usuario.
- El conector está deshabilitado en producción hasta que exista autorización escrita.
- Puede dejar de funcionar, o tener que desactivarse, si Fotocasa cambia sus condiciones o bloquea el conector.
- Solo hay histórico de los anuncios seguidos, es decir, los que el usuario ya importó.
- La entrada manual sigue siendo la alternativa y el usuario siempre confirma los datos rellenados de antemano.

## Alternativas consideradas

- **Rastreador de las páginas de búsqueda de Fotocasa:** rechazada. Contradice `robots.txt` y el principio de producto 7.
- **Descubrimiento por alertas de correo** (alertas de búsqueda del portal a un buzón dedicado, luego las URL al conector de detalle), **feeds autorizados de inmobiliarias** ([D3](/es/adr/d03-source-strategy/)) y la **API de idealista** (si se concede la clave): aplazados a la decisión de descubrimiento.

## Enmienda de decisiones anteriores

Esta decisión enmienda [D3](/es/adr/d03-source-strategy/) y [D17](/es/adr/d17-manual-import-assisted-form/) y precisa el [principio de producto 7](/es/product/principles/).
