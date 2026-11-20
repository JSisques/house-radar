---
title: "HR-F009: Dashboard y estadísticas"
description: "Vista agregada de los datos recopilados."
sidebar:
  order: 9
---

## Resumen

Una vista agregada de los datos recopilados. Las estadísticas se calculan sobre propiedades activas y siempre indican su tamaño de muestra y su procedencia, porque los precios anunciados no son precios reales de compraventa ([D20](/es/adr/d20-listing-consolidation-rules/)).

## Prioridad

P1 (sección de origen 9).

## Módulos responsables

- `apps/api`, contextos delimitados `properties` (recuentos, distribuciones, estadísticas de precio) y `pricing-history` (evolución en el tiempo).
- `apps/web`: pantalla del dashboard y gráficos tras un adaptador de gráficos ([D10](/es/adr/d10-cross-cutting-architecture/)).
- `packages/domain`: definiciones de estadísticas compartidas por API y web.

## Dependencias

- [HR-F002](/es/features/hr-f002-normalization/): tipo de propiedad, superficie construida, ubicación y precio por metro cuadrado.
- [HR-F003](/es/features/hr-f003-search/): precio representativo y definición de propiedad activa.
- [HR-F008](/es/features/hr-f008-price-history/): observaciones para la evolución de los precios.
- [HR-F001](/es/features/hr-f001-ingestion/): fuente de cada anuncio, usada para la procedencia.
- ADR: [D6](/es/adr/d06-persistence/), [D10](/es/adr/d10-cross-cutting-architecture/), [D12](/es/adr/d12-web-internationalization/), [D18](/es/adr/d18-location-pin-declared-precision/), [D19](/es/adr/d19-search-read-model/), [D20](/es/adr/d20-listing-consolidation-rules/).

## Historias de usuario

- Como usuario, quiero una visión general de lo que House Radar ha recopilado, para entender el estado de los datos.
- Como usuario, quiero estadísticas por municipio, para comparar zonas.
- Como usuario, quiero que cada cifra me indique en cuántas propiedades se basa, para no confiar en exceso en una muestra pequeña.

## Reglas de negocio

- **HR-F009-BR1:** las estadísticas se calculan sobre propiedades activas, las que tienen al menos un anuncio activo, salvo que una cifra indique lo contrario ([D20](/es/adr/d20-listing-consolidation-rules/)).
- **HR-F009-BR2:** toda estadística muestra su tamaño de muestra y su procedencia, es decir, cuántas propiedades abarca y de qué fuentes. Un aviso visible indica que los precios anunciados no son precios reales de compraventa.
- **HR-F009-BR3:** el dashboard muestra el número total de propiedades recopiladas (todas las propiedades, incluidas las que no tienen anuncios activos), el número de anuncios activos y el número de anuncios nuevos.
- **HR-F009-BR4:** las estadísticas de precio (precio medio, precio mediano) usan el precio representativo de cada propiedad activa ([D19](/es/adr/d19-search-read-model/)).
- **HR-F009-BR5:** el precio medio por metro cuadrado usa únicamente la superficie construida. Las propiedades sin superficie construida se excluyen y el tamaño de la muestra lo refleja ([D20](/es/adr/d20-listing-consolidation-rules/)).
- **HR-F009-BR6:** la superficie media de las viviendas usa la superficie construida; las propiedades con superficie construida desconocida se excluyen de ella y de su tamaño de muestra.
- **HR-F009-BR7:** el dashboard muestra la distribución por tipo de propiedad y la distribución geográfica, usando el municipio y la provincia derivados de los pines ([D18](/es/adr/d18-location-pin-declared-precision/)). Las propiedades con tipo o ubicación desconocidos se muestran como «desconocido» y no se descartan.
- **HR-F009-BR8:** el dashboard muestra la evolución en el tiempo de los precios de los anuncios recopilados, construida a partir de observaciones ([HR-F008](/es/features/hr-f008-price-history/)), indicando la fecha de la primera observación.
- **HR-F009-BR9:** las estadísticas por municipio agrupan las propiedades activas por municipio derivado, cada una con su propio tamaño de muestra.
- **HR-F009-BR10:** no se muestra ninguna estadística sin datos; un conjunto de datos vacío muestra un estado vacío, nunca ceros presentados como resultados.
- **HR-F009-BR11:** todas las etiquetas, formatos numéricos y formatos de moneda son español primero y traducibles ([D12](/es/adr/d12-web-internationalization/)); los gráficos ofrecen una alternativa textual.
- **HR-F009-BR12:** un «anuncio nuevo» es un anuncio observado por primera vez en los últimos 7 días.
- **HR-F009-BR13:** el gráfico de evolución de precios representa la mediana.
- **HR-F009-BR14:** cuando una estadística abarca menos de 5 propiedades, se muestra con una advertencia de muestra pequeña; nunca se oculta.

## Criterios de aceptación

- **HR-F009-AC1:** Dadas 10 propiedades de las cuales 8 tienen un anuncio activo, Cuando se muestra el dashboard, Entonces el total de propiedades recopiladas es 10 y las estadísticas se refieren a 8.
- **HR-F009-AC2:** Dadas propiedades activas con precios representativos de 100 000 €, 200 000 € y 600 000 €, Cuando se muestra el dashboard, Entonces el precio medio es 300 000 € y la mediana 200 000 €, con un tamaño de muestra de 3.
- **HR-F009-AC3:** Dadas 4 propiedades activas de las cuales 1 no tiene superficie construida, Cuando se muestra el precio medio por metro cuadrado, Entonces se calcula sobre 3 propiedades y el tamaño de la muestra indica 3.
- **HR-F009-AC4:** Dada cualquier estadística, Cuando se muestra, Entonces indica su tamaño de muestra y su procedencia.
- **HR-F009-AC5:** Dado el dashboard, Cuando se muestra, Entonces un aviso indica que los precios anunciados no son precios reales de compraventa.
- **HR-F009-AC6:** Dadas propiedades de varios tipos, Cuando se muestra el dashboard, Entonces la distribución por tipo enumera cada tipo con su recuento, incluido «desconocido».
- **HR-F009-AC7:** Dadas propiedades en dos municipios, Cuando se muestran las estadísticas por municipio, Entonces cada municipio muestra su propio precio medio y tamaño de muestra.
- **HR-F009-AC8:** Dadas propiedades sin pin, Cuando se muestra la distribución geográfica, Entonces aparecen bajo «ubicación desconocida».
- **HR-F009-AC9:** Dado un anuncio que desaparece, Cuando se recalcula el dashboard, Entonces deja de contar como activo y la propiedad sale de las estadísticas si no tiene otro anuncio activo.
- **HR-F009-AC10:** Dadas observaciones a lo largo del tiempo, Cuando se muestra el dashboard, Entonces el gráfico de evolución de precios muestra la serie y la fecha de la primera observación.
- **HR-F009-AC11:** Dada la ausencia de datos recopilados, Cuando se muestra el dashboard, Entonces se muestra un estado vacío en lugar de valores cero.
- **HR-F009-AC12:** Dados un anuncio observado por primera vez hace 5 días y otro hace 10 días, Cuando se muestra el número de anuncios nuevos, Entonces solo cuenta el primero.
- **HR-F009-AC13:** Dadas observaciones de precio a lo largo del tiempo, Cuando se muestra el gráfico de evolución de precios, Entonces representa la mediana.
- **HR-F009-AC14:** Dada una estadística calculada sobre 4 propiedades, Cuando se muestra, Entonces aparece con una advertencia de muestra pequeña.

## Casos límite

- Un municipio con una única propiedad: sus estadísticas se muestran con tamaño de muestra 1, lo que se indica claramente.
- Precios de magnitudes muy distintas distorsionan la media: la mediana se muestra junto a ella.
- Una propiedad vinculada desde dos anuncios cuenta una sola vez.
- Propiedades cuyos anuncios proceden de una sola fuente: la procedencia muestra esa única fuente.
- Datos que cambian con el dashboard abierto: las cifras se actualizan al recargar y muestran su hora de cálculo.
- Estadísticas por municipio de propiedades con pines de precisión de municipio: se incluyen a nivel de municipio.

## Fuera de alcance (MVP)

- Estimación del valor de mercado y rentabilidad de inversión ([fuera de alcance](/es/product/out-of-scope/)).
- Dashboards definidos por el usuario o métricas personalizadas.
- Exportar estadísticas.

## Decisiones relacionadas

[D6](/es/adr/d06-persistence/), [D10](/es/adr/d10-cross-cutting-architecture/), [D12](/es/adr/d12-web-internationalization/), [D18](/es/adr/d18-location-pin-declared-precision/), [D19](/es/adr/d19-search-read-model/), [D20](/es/adr/d20-listing-consolidation-rules/).
