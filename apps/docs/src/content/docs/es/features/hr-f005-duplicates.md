---
title: "HR-F005: Detección de duplicados"
description: "Una misma vivienda puede anunciarse en varios portales. House Radar debe diferenciar el inmueble real de los anuncios publicados sobre él."
sidebar:
  order: 5
---

## Resumen

Una misma vivienda puede anunciarse en varios portales. House Radar diferencia el inmueble real de los anuncios publicados sobre él. El sistema sugiere candidatos a duplicado y nunca fusiona automáticamente; el usuario resuelve cada candidato como «misma propiedad» o «propiedad distinta» ([D21](/es/adr/d21-duplicate-detection-policy/)).

## Prioridad

P0 (sección de origen 5).

## Módulos responsables

- `apps/api`, contextos delimitados `properties` (agregado propiedad, vinculación, pares descartados) y `listings` (datos que compara la detección).
- `apps/web`: pantalla de revisión de duplicados y la lista de candidatos en la ficha de la propiedad.
- `packages/domain`: reglas de candidatos y umbrales configurables.

## Dependencias

- [HR-F001](/es/features/hr-f001-ingestion/): aporta los anuncios que se comparan.
- [HR-F002](/es/features/hr-f002-normalization/): ubicación, superficie construida, habitaciones, fuente e identificador externo.
- [HR-F004](/es/features/hr-f004-property-detail/): muestra los candidatos en la ficha de la propiedad.
- [HR-F003](/es/features/hr-f003-search/) y [HR-F008](/es/features/hr-f008-price-history/): consumen la propiedad consolidada tras un vínculo.
- ADR: [D4](/es/adr/d04-backend-framework/), [D19](/es/adr/d19-search-read-model/), [D20](/es/adr/d20-listing-consolidation-rules/), [D21](/es/adr/d21-duplicate-detection-policy/).

## Historias de usuario

- Como usuario, quiero que el sistema sugiera anuncios que pueden ser la misma vivienda, para no verla dos veces.
- Como usuario, quiero decidir yo mismo si dos anuncios son la misma propiedad, para que nunca se fusionen por error dos viviendas distintas.
- Como usuario, quiero que un par que he rechazado no se vuelva a sugerir, para que la revisión no sea repetitiva.

## Reglas de negocio

- **HR-F005-BR1:** el sistema sugiere candidatos y nunca fusiona automáticamente. Todo vínculo entre anuncios procede de una acción explícita del usuario ([D21](/es/adr/d21-duplicate-detection-policy/)).
- **HR-F005-BR2:** un par de anuncios es candidato cuando tienen la misma fuente y el mismo identificador externo.
- **HR-F005-BR3:** un par de anuncios también es candidato cuando la distancia entre sus ubicaciones es inferior a 100 m, sus superficies construidas difieren como máximo un 5 % y tienen el mismo número de habitaciones.
- **HR-F005-BR4:** los umbrales (100 m y 5 %) son configurables.
- **HR-F005-BR5:** los valores desconocidos nunca cuentan como coincidencia. Un anuncio sin ubicación, superficie construida o habitaciones no puede ser candidato mediante BR3.
- **HR-F005-BR6:** el usuario resuelve un candidato como «misma propiedad», lo que vincula los anuncios a una única propiedad, o como «propiedad distinta», lo que descarta el par.
- **HR-F005-BR7:** un par descartado se recuerda y no se vuelve a sugerir.
- **HR-F005-BR8:** la detección es idempotente: volver a ejecutarla no duplica un candidato abierto, uno resuelto ni uno descartado.
- **HR-F005-BR9:** el precio no es un criterio para ser candidato; se muestra durante la revisión, junto con los datos de ubicación y los demás campos comparados, para ayudar al usuario a decidir.
- **HR-F005-BR10:** tras un vínculo, la propiedad consolida sus anuncios según las reglas de [D20](/es/adr/d20-listing-consolidation-rules/) y la búsqueda la muestra una sola vez ([D19](/es/adr/d19-search-read-model/)).
- **HR-F005-BR11:** la detección se ejecuta cuando se crea un anuncio o cuando cambian su ubicación, superficie construida o habitaciones, y no bloquea la ingesta.

## Criterios de aceptación

- **HR-F005-AC1:** Dados dos anuncios con la misma fuente y el mismo identificador externo, Cuando se ejecuta la detección, Entonces aparecen como un par candidato.
- **HR-F005-AC2:** Dados dos anuncios a 80 m de distancia con superficies construidas de 100 m² y 104 m² y 3 habitaciones cada uno, Cuando se ejecuta la detección, Entonces aparecen como un par candidato.
- **HR-F005-AC3:** Dados dos anuncios a 120 m de distancia con la misma superficie y habitaciones, Cuando se ejecuta la detección, Entonces no son un par candidato.
- **HR-F005-AC4:** Dados dos anuncios con superficies construidas de 100 m² y 106 m², Cuando se ejecuta la detección, Entonces no son candidatos por el criterio de ubicación.
- **HR-F005-AC5:** Dados dos anuncios con distinto número de habitaciones, Cuando se ejecuta la detección, Entonces no son candidatos por el criterio de ubicación.
- **HR-F005-AC6:** Dado un anuncio con superficie construida desconocida, Cuando se ejecuta la detección, Entonces no es candidato por el criterio de ubicación.
- **HR-F005-AC7:** Dado un par candidato, Cuando el usuario selecciona «misma propiedad», Entonces ambos anuncios pertenecen a una única propiedad y la búsqueda la muestra una sola vez.
- **HR-F005-AC8:** Dado un par candidato, Cuando el usuario selecciona «propiedad distinta», Entonces el par se descarta y no aparece en la lista de candidatos.
- **HR-F005-AC9:** Dado un par descartado, Cuando la detección se ejecuta de nuevo, Entonces el par no se vuelve a sugerir.
- **HR-F005-AC10:** Dado un umbral modificado en la configuración, Cuando se ejecuta la detección, Entonces se aplica el nuevo umbral.
- **HR-F005-AC11:** Dada una coincidencia muy fuerte, Cuando se ejecuta la detección, Entonces ningún anuncio se vincula hasta que el usuario resuelve el candidato.

## Casos límite

- Un anuncio es candidato de varios otros: cada par se resuelve de forma independiente.
- Vincular A con B y B con C da como resultado una propiedad con tres anuncios.
- Los anuncios candidatos tienen pines distintos para lo que el usuario considera la misma vivienda: el usuario puede resolverlos igualmente como la misma propiedad.
- Un anuncio cambia su ubicación después de que su par fuera descartado: el descarte sigue aplicándose a ese par.
- Resolver mientras la ingesta está en curso no hace perder ninguna de las dos decisiones.
- Dos anuncios de la misma fuente con distinto identificador externo pueden ser candidatos igualmente por el criterio de ubicación.

## Fuera de alcance (MVP)

- Fusión automática, con o sin nivel de confianza.
- Comparar fotografías o descripciones para detectar duplicados.
- Detectar duplicados a partir del texto de la dirección (la geocodificación se aplaza, [D18](/es/adr/d18-location-pin-declared-precision/)).

## Preguntas abiertas

- ¿Puede deshacerse un vínculo entre anuncios y qué ocurre con la propiedad y su histórico si se deshace?
- Cuando se vinculan dos propiedades con ubicaciones distintas, ¿qué ubicación conserva la propiedad que permanece?
- ¿Dónde se configuran los umbrales: en la configuración del despliegue o en una pantalla de administración?

## Decisiones relacionadas

[D4](/es/adr/d04-backend-framework/), [D19](/es/adr/d19-search-read-model/), [D20](/es/adr/d20-listing-consolidation-rules/), [D21](/es/adr/d21-duplicate-detection-policy/).
