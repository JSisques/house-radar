---
title: "HR-F008: Histórico y seguimiento de precios"
description: "El histórico es uno de los elementos que pueden diferenciar a House Radar de un buscador inmobiliario tradicional."
sidebar:
  order: 8
---

## Resumen

El histórico de precios es uno de los elementos que diferencian a House Radar de un buscador inmobiliario tradicional. Todo cambio en un anuncio es una observación; el histórico se almacena por anuncio y la propiedad muestra la evolución de su menor precio activo ([D20](/es/adr/d20-listing-consolidation-rules/)). El histórico solo refleja lo que House Radar ha observado.

## Prioridad

P0 (sección de origen 8).

## Módulos responsables

- `apps/api`, contexto delimitado `pricing-history`: observaciones, snapshots, cálculos de variación y series a nivel de propiedad.
- `apps/ingestion`: produce observaciones en cada ejecución.
- `apps/web`: sección de histórico y gráfico en la ficha de la propiedad, tras un adaptador de gráficos ([D10](/es/adr/d10-cross-cutting-architecture/)).
- `packages/domain`: definiciones de observación y variación.

## Dependencias

- [HR-F001](/es/features/hr-f001-ingestion/): las ejecuciones y comprobaciones manuales crean observaciones.
- [HR-F002](/es/features/hr-f002-normalization/): atributos normalizados cuyos cambios se registran.
- [HR-F004](/es/features/hr-f004-property-detail/): muestra el histórico.
- [HR-F005](/es/features/hr-f005-duplicates/): vincular anuncios cambia la serie a nivel de propiedad.
- [HR-F009](/es/features/hr-f009-dashboard/): estadísticas de evolución de precios.
- ADR: [D3](/es/adr/d03-source-strategy/), [D6](/es/adr/d06-persistence/), [D10](/es/adr/d10-cross-cutting-architecture/), [D20](/es/adr/d20-listing-consolidation-rules/).

## Historias de usuario

- Como usuario, quiero ver cómo ha evolucionado el precio de una propiedad, para saber si ha ido bajando.
- Como usuario, quiero conocer el precio inicial, el precio actual y la variación, para valorar el margen de negociación.
- Como usuario, quiero saber cuándo desapareció un anuncio, para entender si la propiedad sigue disponible.

## Reglas de negocio

- **HR-F008-BR1:** el histórico se construye a partir de observaciones. Una observación registra el anuncio, la fecha de observación, el precio (haya cambiado o no) y si el anuncio seguía activo ([D20](/es/adr/d20-listing-consolidation-rules/)).
- **HR-F008-BR2:** las observaciones proceden de las ejecuciones automáticas y de la acción manual «comprobar anuncio». La importación manual inicial es la primera observación.
- **HR-F008-BR3:** cada observación almacena un snapshot del anuncio normalizado, en la medida en que las condiciones de su fuente permitan almacenar snapshots e histórico propio ([D3](/es/adr/d03-source-strategy/)).
- **HR-F008-BR4:** el histórico de precios se almacena por anuncio. Se registra un cambio de precio cuando una observación muestra un precio distinto del anterior; también se registran los cambios relevantes en otros atributos.
- **HR-F008-BR5:** la propiedad muestra la evolución de su menor precio activo: en cada momento, el menor precio entre los anuncios que estaban activos en ese momento.
- **HR-F008-BR6:** el precio inicial conocido es el de la primera observación; el precio actual es el de la última observación. Para una propiedad, son el primer y el actual precio representativo.
- **HR-F008-BR7:** la variación absoluta es el precio actual menos el precio inicial; la variación porcentual es esa diferencia dividida por el precio inicial. Ambas son datos calculados.
- **HR-F008-BR8:** un anuncio se registra como desaparecido mediante una acción manual o, en fuentes automáticas, tras N ejecuciones consecutivas sin verlo (3 por defecto). La desaparición es un evento del histórico ([D20](/es/adr/d20-listing-consolidation-rules/)).
- **HR-F008-BR9:** el histórico refleja únicamente lo observado por House Radar desde la primera observación. La interfaz indica la fecha de la primera observación y nunca presenta el histórico como completo.
- **HR-F008-BR10:** la evolución se muestra en un gráfico con una alternativa textual accesible. Los precios están en euros, con formatos español primero ([D12](/es/adr/d12-web-internationalization/)).
- **HR-F008-BR11:** las observaciones son inmutables: una corrección es una nueva observación.
- **HR-F008-BR12:** las observaciones se conservan para siempre; no hay compactación en el MVP.

## Criterios de aceptación

- **HR-F008-AC1:** Dado un anuncio nuevo, Cuando se crea, Entonces se almacena una primera observación con su precio y fecha.
- **HR-F008-AC2:** Dado un anuncio de 200 000 €, Cuando una observación muestra 190 000 €, Entonces se registra un cambio de precio y el histórico tiene dos puntos.
- **HR-F008-AC3:** Dado un anuncio, Cuando una observación muestra el mismo precio, Entonces no se registra ningún cambio de precio y se actualiza la fecha de última comprobación.
- **HR-F008-AC4:** Dados un precio inicial de 200 000 € y un precio actual de 190 000 €, Cuando se muestra el histórico, Entonces la variación absoluta es -10 000 € y la variación porcentual es -5 %.
- **HR-F008-AC5:** Dada una propiedad con una única observación, Cuando se muestra el histórico, Entonces el precio inicial y el actual son iguales y la variación es cero.
- **HR-F008-AC6:** Dada una propiedad con dos anuncios activos de 200 000 € y 190 000 €, Cuando desaparece el anuncio de 190 000 €, Entonces la serie de la propiedad muestra el menor precio activo subiendo a 200 000 € en esa fecha.
- **HR-F008-AC7:** Dada una fuente automática y N = 3, Cuando un anuncio no se ve en tres ejecuciones consecutivas, Entonces se registra una desaparición en su histórico.
- **HR-F008-AC8:** Dado un anuncio observado por primera vez el 2026-11-20, Cuando se muestra el histórico, Entonces la interfaz indica que abarca datos desde el 2026-11-20.
- **HR-F008-AC9:** Dada una observación con un atributo distinto del precio modificado, Cuando se almacena, Entonces el cambio queda registrado en el histórico.
- **HR-F008-AC10:** Dada una propiedad con histórico, Cuando el usuario abre la ficha de la propiedad, Entonces un gráfico muestra la evolución de su menor precio activo.
- **HR-F008-AC11:** Dada una observación almacenada, Cuando una observación posterior difiere, Entonces la observación anterior no se modifica.
- **HR-F008-AC12:** Dadas observaciones de cualquier antigüedad, Cuando se muestra el histórico de precios, Entonces todas están disponibles.

## Casos límite

- Observación con precio desconocido: la observación se almacena con precio desconocido y no cuenta como cambio de precio.
- Un anuncio que desaparece y más tarde reaparece: ambos eventos quedan registrados y el anuncio vuelve a estar activo.
- El precio vuelve a un valor anterior: se registra un nuevo cambio; los puntos anteriores no se fusionan.
- Vincular dos anuncios cuando ambos ya tienen histórico: la serie de la propiedad se recalcula a partir de los históricos por anuncio sin alterarlos.
- Una propiedad sin anuncios activos: la serie termina en la desaparición y no se muestra precio actual.
- El usuario comprueba un anuncio manual varias veces el mismo día: cada comprobación es una observación.

## Fuera de alcance (MVP)

- Predicción de bajadas de precio ([fuera de alcance](/es/product/out-of-scope/)).
- Reconstruir el histórico anterior a la primera observación.
- Datos históricos procedentes de fuentes externas.
- Alertas por cambios de precio ([HR-F011](/es/features/hr-f011-notifications/), posterior al MVP).

## Decisiones relacionadas

[D3](/es/adr/d03-source-strategy/), [D6](/es/adr/d06-persistence/), [D10](/es/adr/d10-cross-cutting-architecture/), [D12](/es/adr/d12-web-internationalization/), [D20](/es/adr/d20-listing-consolidation-rules/), [D28](/es/adr/d28-bounded-context-map/), [D29](/es/adr/d29-aggregate-boundaries/).

Véase también: [Agregados](/es/domain/aggregates/), [Mapa de contextos](/es/architecture/context-map/).
