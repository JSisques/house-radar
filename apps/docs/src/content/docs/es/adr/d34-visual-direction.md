---
title: "D34. Dirección visual: Folla catastral"
description: "Identidad visual de ficha de topógrafo: paleta gris niebla fría, tres tipografías y una trama cartográfica que dibuja los valores desconocidos en lugar de ocultarlos."
sidebar:
  order: 35
---

- **Estado:** Aceptada
- **Fecha:** 2026-11-20

## Contexto

`apps/web` es una SPA React + Vite ([D5](/es/adr/d05-frontend-framework/)) con Tailwind y shadcn/ui y organizada con diseño atómico (convención C8, véanse las [Convenciones de código](/es/architecture/conventions/)). Los textos están internacionalizados desde el inicio ([D12](/es/adr/d12-web-internationalization/)). El principio de producto 4 es «no inventar información»: la mayoría de los anuncios omiten campos y la interfaz debe distinguir «no tiene» de «no lo sabemos». Hace falta una dirección visual antes del esqueleto web para que los valores desconocidos, los conflictos y los cambios de precio tengan una representación coherente y accesible.

## Decisión

**Dirección «Folla catastral».** Una ficha de topógrafo, no un escaparate inmobiliario. Cada dato tiene fuente y fecha; lo que no se ha medido se dibuja como terreno sin medir. El sistema completo renderizado está en [Sistema de diseño](/es/architecture/design-system/).

**Paleta** (claro / oscuro):

| Token | Claro | Oscuro | Rol |
| --- | --- | --- | --- |
| Brétema (fondo) | `#E6E9E7` | `#1E2A30` | Gris niebla frío, nunca crema; la base oscura es Lousa |
| Lousa (tinta) | `#1E2A30` | `#E6E9E7` | Texto principal; fondo del tema oscuro |
| Musgo (primario) | `#2F5D4E` | `#8CC2AC` | Acciones, selección, foco |
| Atlántico (geo) | `#3C6E8F` | `#8DB8D6` | Mapa, enlaces, datos geográficos |
| Líquen (acento) | `#D4A017` | `#D4A017` | Acento escaso: novedades y bajadas de precio; siempre con texto oscuro |
| Ferruxe (aviso) | `#9E4A2F` | `#E39575` | Subidas de precio y errores; nunca solo por color |
| Superficie | `#F3F5F4` | `#26343B` | Tarjetas y paneles |
| Atenuado | `#4A575E` | `#AEB8B4` | Texto secundario |
| Línea | `#C3CAC7` | `#3E4E56` | Bordes y separadores |
| Trama | `#9AA4A0` | `#5C6B71` | Patrón de valor desconocido |
| Mapa | `#D5DEDB` | `#22323A` | Fondo del mapa |

**Tipografía.** Schibsted Grotesk para títulos (700 a 800, con moderación), Public Sans para cuerpo e interfaz e IBM Plex Mono con cifras tabulares para precios, superficies, coordenadas y fechas.

**Firma: lo desconocido se dibuja.** Un valor que la fuente no declara se dibuja con una trama cartográfica (líneas a 135°, 1px cada 8px, token de trama al 55 % de opacidad para que el texto encima siga siendo legible, con el token de trama), un borde discontinuo y los textos «sin dato» y «no declarado» (traducidos por idioma). Nunca se muestra como `—`, vacío o cero. El gráfico del historial de precios dibuja el periodo anterior a la primera observación como un área rayada «sin observar».

**Reglas.**

- **Conflictos:** un atributo cuyas fuentes discrepan lleva borde Ferruxe y nombra el valor de la otra fuente.
- **Estados del precio:** una bajada es una etiqueta Líquen con flecha hacia abajo; una subida es una etiqueta con borde Ferruxe y flecha hacia arriba; ambas indican el importe. Líquen se usa también para novedades y en ningún otro caso.
- **Ubicación aproximada** se dibuja como un círculo discontinuo en el mapa, no como un pin.

**Fuentes del lienzo** versionadas en `apps/docs/design/folla-catastral/` como guía de pantallas (búsqueda, detalle, importación asistida). El lienzo vivo es privado.

## Consecuencias

- Los tokens se implementan como variables CSS más un tema de Tailwind en `apps/web` durante el slice del esqueleto web de M0; los componentes nunca usan valores hexadecimales directos.
- El renderizado de lo desconocido es un único componente compartido, de modo que todas las pantallas muestran los datos ausentes igual y la regla no se puede eludir con un `—` ad hoc.
- Accesibilidad: el texto y los colores de estado mantienen contraste suficiente en ambos temas (Líquen siempre lleva texto oscuro) y el color nunca es la única señal (flechas y texto acompañan a los cambios de precio y a los errores).
- Las fuentes se alojan en local con Fontsource (sin peticiones a terceros), en el portal de documentación desde ya y en `apps/web` desde el esqueleto web de M0, con pilas de fuentes del sistema como alternativa. El portal aplica la misma dirección mediante las variables de tema de Starlight (`apps/docs/src/styles/theme.css`).
- La identidad distintiva exige disciplina: Líquen debe seguir siendo escaso y la trama reservada a lo desconocido.

## Alternativas consideradas

- **Aspecto genérico de portal (crema y terracota, o el neutro por defecto de shadcn):** familiar pero indistinto, y no ofrece un lenguaje visual para los valores desconocidos, que acabarían ocultos tras guiones o vacíos. Descartada.
