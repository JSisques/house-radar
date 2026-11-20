---
title: "D12. Internacionalización web"
description: "`apps/web` preparado para i18n desde el inicio; la primera release solo incluye español. Gallego, catalán y otros idiomas se añadirán como t"
sidebar:
  order: 13
---

- **Estado:** Aceptada
- **Fecha:** 2026-11-20

## Contexto

La aplicación web debe poder soportar más idiomas con el tiempo, aunque la primera release solo necesita español.

## Decisión

`apps/web` preparado para i18n desde el inicio; la primera release solo incluye español. Gallego, catalán y otros idiomas se añadirán como traducciones.

## Consecuencias

- Ningún texto de interfaz se escribe directamente en los componentes: todo pasa por claves de traducción.
- Formato de fechas, números, precios y superficies dependiente del locale.
- La librería de i18n se accede mediante un adaptador ([D10](/es/adr/d10-cross-cutting-architecture/)).
- La funcionalidad «Multiidioma» de la sección 13 pasa a significar únicamente añadir traducciones; la infraestructura ya existe.
