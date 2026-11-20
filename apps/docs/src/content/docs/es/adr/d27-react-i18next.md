---
title: "D27. react-i18next"
description: "apps/web usa react-i18next detrás del adaptador de i18n, con claves tipadas, un namespace por contexto e Intl para el formateo."
sidebar:
  order: 28
---

- **Estado:** Aceptada
- **Fecha:** 2026-11-20

## Contexto

[D12](/es/adr/d12-web-internationalization/) exige que `apps/web` esté preparado para i18n desde el inicio, con español primero y gallego y catalán después, y que la librería esté detrás de un adaptador ([D10](/es/adr/d10-cross-cutting-architecture/)). Esa decisión dejó abierta la elección de la librería.

## Decisión

Usar `react-i18next` detrás del adaptador de i18n.

- Un namespace por contexto, leído con `useTranslation`.
- Claves tipadas mediante una declaración de recursos de TypeScript, de modo que una clave mal escrita no compila.
- Carga diferida por idioma y un test que verifica la paridad de idiomas.
- Precios, superficies y fechas se formatean con la API nativa `Intl` (`Intl.NumberFormat` con `currency: 'EUR'`, `Intl.DateTimeFormat`) dentro del adaptador.

Los detalles están en [Convenciones de código](/es/architecture/conventions/).

## Consecuencias

- Añadir un idioma significa añadir solo archivos de traducción.
- Las claves tipadas detectan claves ausentes o mal escritas en compilación.
- El formateo no depende de la librería de traducción.
- Los componentes dependen del adaptador, de modo que la librería sigue siendo sustituible.

## Alternativas consideradas

- **FormatJS (`react-intl`):** sintaxis de mensajes ICU y formateo incorporado. Descartada porque el formateo ya lo cubre `Intl`, y la configuración resultante es más pesada para la misma necesidad.
- **Lingui:** extracción en compilación y bundles pequeños. Descartada porque su tooling de macros y extracción añade una complejidad de build que este proyecto no necesita.
