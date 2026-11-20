---
title: "HR-F004: Fichas de propiedades"
description: "Cada propiedad tendrá su propia ficha de detalle."
sidebar:
  order: 4
---

## Resumen

Cada propiedad tiene su propia ficha de detalle. Muestra los datos consolidados de la propiedad, cada anuncio publicado sobre ella con su fuente, precio y enlace al original, los conflictos entre fuentes, el histórico de precios y los posibles duplicados.

## Prioridad

P0 (sección de origen 4).

## Módulos responsables

- `apps/web`: pantalla de ficha de la propiedad y sus componentes.
- `apps/api`, contextos delimitados `properties` (vista consolidada), `listings` (anuncios y observaciones) y `pricing-history` (histórico mostrado en la ficha).
- `packages/domain`: reglas de consolidación y tipos de dato.

## Dependencias

- [HR-F002](/es/features/hr-f002-normalization/): campos, ubicación y tipos de dato.
- [HR-F005](/es/features/hr-f005-duplicates/): posibles anuncios duplicados y su resolución.
- [HR-F008](/es/features/hr-f008-price-history/): histórico de precios y gráfico.
- [HR-F006](/es/features/hr-f006-map/): ubicación en un mapa.
- [HR-F007](/es/features/hr-f007-favorites-saved-searches/): marcar la propiedad como favorita.
- [HR-F001](/es/features/hr-f001-ingestion/): la acción «comprobar anuncio» de los anuncios manuales.
- ADR: [D3](/es/adr/d03-source-strategy/), [D12](/es/adr/d12-web-internationalization/), [D17](/es/adr/d17-manual-import-assisted-form/), [D18](/es/adr/d18-location-pin-declared-precision/), [D19](/es/adr/d19-search-read-model/), [D20](/es/adr/d20-listing-consolidation-rules/).

## Historias de usuario

- Como usuario, quiero ver todo lo que se sabe de una propiedad en un solo lugar, para decidir si merece una visita.
- Como usuario, quiero ver de dónde procede cada anuncio y poder abrir el original, para verificar los datos en su fuente.
- Como usuario, quiero ver cuándo las fuentes discrepan, para saber qué datos conviene comprobar de nuevo.

## Reglas de negocio

- **HR-F004-BR1:** la ficha muestra título y descripción, precio representativo, características principales, características adicionales, ubicación con su precisión declarada, superficie construida, superficie de terreno y precio por metro cuadrado cuando puede calcularse.
- **HR-F004-BR2:** la ficha enumera cada anuncio de la propiedad con su fuente, su precio propio, su estado, su fecha de incorporación y un enlace al anuncio original. El enlace a la fuente original forma parte del alcance P0.
- **HR-F004-BR3:** el precio representativo es el menor precio entre los anuncios activos y se presenta junto con el número de anuncios ([D19](/es/adr/d19-search-read-model/)).
- **HR-F004-BR4:** cuando los anuncios discrepan en un atributo, la ficha muestra el valor observado más reciente, señala el conflicto y muestra cada valor con su fuente ([D20](/es/adr/d20-listing-consolidation-rules/)).
- **HR-F004-BR5:** los valores desconocidos se muestran como desconocidos; la ficha nunca muestra un valor en blanco, cero o inferido sin marcarlo. Los datos calculados e inferidos se marcan como tales.
- **HR-F004-BR6:** el precio por metro cuadrado solo se muestra cuando se conoce la superficie construida; en caso contrario se muestra como desconocido ([D20](/es/adr/d20-listing-consolidation-rules/)).
- **HR-F004-BR7:** la galería de fotos muestra únicamente imágenes cuyo uso permite su fuente ([HR-F001](/es/features/hr-f001-ingestion/)). Sin imágenes permitidas, la ficha no muestra galería y mantiene el enlace al original.
- **HR-F004-BR8:** la ficha muestra la fecha en que se incorporó la propiedad y la de su última actualización, y el histórico de precios disponible ([HR-F008](/es/features/hr-f008-price-history/)) con el aviso de que solo abarca datos observados.
- **HR-F004-BR9:** la ficha muestra los posibles anuncios duplicados como candidatos para revisión ([HR-F005](/es/features/hr-f005-duplicates/)); nunca los vincula automáticamente.
- **HR-F004-BR10:** para cada anuncio manual la ficha ofrece «comprobar anuncio» y «marcar como desaparecido» ([D17](/es/adr/d17-manual-import-assisted-form/), [D20](/es/adr/d20-listing-consolidation-rules/)).
- **HR-F004-BR11:** todas las etiquetas, formatos numéricos y fechas son español primero y traducibles ([D12](/es/adr/d12-web-internationalization/)).

## Criterios de aceptación

- **HR-F004-AC1:** Dada una propiedad con dos anuncios de fuentes distintas, Cuando el usuario abre su ficha, Entonces ambos anuncios aparecen con fuente, precio, estado y un enlace a su original.
- **HR-F004-AC2:** Dados anuncios que discrepan en habitaciones (3 y 4), Cuando se muestra la ficha, Entonces muestra el valor más reciente, marca el conflicto y muestra ambos valores con sus fuentes.
- **HR-F004-AC3:** Dada una propiedad sin superficie construida, Cuando se muestra la ficha, Entonces el precio por metro cuadrado aparece como desconocido.
- **HR-F004-AC4:** Dada una propiedad cuyo pin tiene precisión `approximate`, Cuando se muestra la ficha, Entonces la ubicación indica que es aproximada.
- **HR-F004-AC5:** Dada una propiedad sin imágenes de anuncio permitidas, Cuando se muestra la ficha, Entonces no se muestra galería y el enlace al original está presente.
- **HR-F004-AC6:** Dada una propiedad con observaciones de precio, Cuando se muestra la ficha, Entonces aparece el histórico de precios con un aviso de que comienza en la primera observación.
- **HR-F004-AC7:** Dados candidatos a duplicado pendientes para la propiedad, Cuando se muestra la ficha, Entonces se enumeran para su revisión y ninguno se vincula hasta que el usuario lo resuelve.
- **HR-F004-AC8:** Dado un anuncio manual activo, Cuando el usuario selecciona «marcar como desaparecido», Entonces su estado pasa a `disappeared` y se recalcula el precio representativo.
- **HR-F004-AC9:** Dada una propiedad con un valor desconocido, Cuando se muestra la ficha, Entonces el valor se muestra como desconocido y no como vacío ni cero.
- **HR-F004-AC10:** Dado un identificador que no existe, Cuando el usuario abre la ficha, Entonces se muestra un mensaje de «propiedad no encontrada».

## Casos límite

- Una propiedad sin anuncios activos: la ficha es accesible, muestra los últimos datos y estado conocidos y no tiene precio representativo.
- Un anuncio sin enlace a la fuente (por ejemplo, una importación manual incompleta): no se muestra enlace para él.
- Una descripción muy larga: se muestra completa o plegada, nunca truncada sin una forma de leerla.
- Varios atributos en conflicto a la vez: cada uno se señala de forma independiente.
- Una propiedad fusionada en otra tras resolver un duplicado: su URL anterior redirige a la propiedad que permanece.

## Fuera de alcance (MVP)

- Contactar con el anunciante desde House Radar.
- Renderizado en servidor de las fichas ([D5](/es/adr/d05-frontend-framework/)).
- Análisis de fotos ([fuera de alcance](/es/product/out-of-scope/)).

## Preguntas abiertas

- ¿Puede el usuario editar los datos de un anuncio manual después de crearlo?
- ¿Qué título y descripción de anuncio se muestran cuando los anuncios difieren: siempre el observado más recientemente, o puede elegirlo el usuario?

## Decisiones relacionadas

[D3](/es/adr/d03-source-strategy/), [D12](/es/adr/d12-web-internationalization/), [D17](/es/adr/d17-manual-import-assisted-form/), [D18](/es/adr/d18-location-pin-declared-precision/), [D19](/es/adr/d19-search-read-model/), [D20](/es/adr/d20-listing-consolidation-rules/).
