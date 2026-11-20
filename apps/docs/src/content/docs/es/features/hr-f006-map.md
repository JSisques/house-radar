---
title: "HR-F006: Mapa inmobiliario"
description: "Mapa interactivo para visualizar y explorar propiedades."
sidebar:
  order: 6
---

## Resumen

Un mapa interactivo para visualizar y explorar propiedades. Cada propiedad aparece como un marcador con su precio en su pin, con su precisión declarada visible. El mapa muestra el mismo conjunto de resultados que el buscador y es también la herramienta para colocar el pin de una propiedad. El frontend accede al mapa únicamente a través de un puerto; MapLibre GL es su primer adaptador ([D9](/es/adr/d09-map/)).

## Prioridad

P1 (sección de origen 6).

## Módulos responsables

- `apps/web`: pantalla del mapa, puerto de mapa (marcadores, clustering, selección de área, eventos de movimiento), adaptador MapLibre GL y el selector de pin que usa el formulario de importación manual.
- `apps/api`, contexto delimitado `properties`: consultas espaciales para los resultados mostrados en el mapa.
- `packages/domain`: definiciones de ubicación y precisión.

## Dependencias

- [HR-F002](/es/features/hr-f002-normalization/): ubicación con precisión declarada.
- [HR-F003](/es/features/hr-f003-search/): filtros que definen el conjunto de resultados y el filtro de área establecido desde el mapa.
- [HR-F004](/es/features/hr-f004-property-detail/): destino al abrir un marcador.
- [HR-F001](/es/features/hr-f001-ingestion/): el formulario de importación manual usa el selector de pin.
- ADR: [D6](/es/adr/d06-persistence/), [D9](/es/adr/d09-map/), [D10](/es/adr/d10-cross-cutting-architecture/), [D12](/es/adr/d12-web-internationalization/), [D18](/es/adr/d18-location-pin-declared-precision/), [D19](/es/adr/d19-search-read-model/).

## Historias de usuario

- Como usuario, quiero ver las propiedades en un mapa con sus precios, para entender dónde están las ofertas.
- Como usuario, quiero saber cuán fiable es cada ubicación, para no confundir una posición aproximada con la exacta.
- Como usuario, quiero dibujar un área en el mapa y ver las propiedades que contiene, para buscar en el barrio que me interesa.
- Como usuario, quiero colocar un pin al registrar una propiedad a mano, para que su ubicación se almacene con su precisión.

## Reglas de negocio

- **HR-F006-BR1:** el mapa muestra propiedades, no anuncios. Cada marcador muestra el precio representativo de su propiedad ([D19](/es/adr/d19-search-read-model/)).
- **HR-F006-BR2:** el mapa y la lista de resultados muestran el mismo conjunto de resultados para los filtros actuales ([HR-F003](/es/features/hr-f003-search/)). Seleccionar un resultado resalta su marcador y seleccionar un marcador resalta su resultado.
- **HR-F006-BR3:** abrir un marcador conduce a la ficha de la propiedad ([HR-F004](/es/features/hr-f004-property-detail/)).
- **HR-F006-BR4:** el filtro de área geográfica puede establecerse seleccionando un área en el mapa; la selección es el filtro de polígono de [HR-F003](/es/features/hr-f003-search/).
- **HR-F006-BR5:** la ubicación de una propiedad es su pin con precisión declarada `exact`, `approximate` o `municipality` ([D18](/es/adr/d18-location-pin-declared-precision/)). Los marcadores con precisión `approximate` o `municipality` se distinguen visualmente de los `exact` y lo indican, y una posición aproximada nunca se presenta como exacta.
- **HR-F006-BR6:** las propiedades sin pin no se muestran en el mapa; la pantalla indica cuántos resultados no se muestran por ese motivo.
- **HR-F006-BR7:** cuando hay muchas propiedades, los marcadores cercanos se agrupan en clústeres que muestran su número y se expanden al acercar el zoom o al seleccionarlos.
- **HR-F006-BR8:** el selector de pin coloca o mueve un pin y exige elegir una precisión. Al guardar un pin se derivan el municipio y la provincia ([D18](/es/adr/d18-location-pin-declared-precision/)).
- **HR-F006-BR9:** la biblioteca de mapas se accede únicamente a través del puerto de mapa, de modo que puede sustituirse sin tocar el resto del frontend ([D9](/es/adr/d09-map/), [D10](/es/adr/d10-cross-cutting-architecture/)).
- **HR-F006-BR10:** los textos, formatos de precio y controles del mapa son español primero y traducibles ([D12](/es/adr/d12-web-internationalization/)).

## Criterios de aceptación

- **HR-F006-AC1:** Dados resultados de búsqueda con pin, Cuando el usuario abre el mapa, Entonces cada propiedad aparece una sola vez como un marcador que muestra su precio representativo.
- **HR-F006-AC2:** Dada una propiedad con dos anuncios activos, Cuando se muestra el mapa, Entonces tiene un marcador, no dos.
- **HR-F006-AC3:** Dado un marcador, Cuando el usuario lo selecciona, Entonces se abre la ficha de la propiedad.
- **HR-F006-AC4:** Dadas la lista y el mapa con los mismos filtros, Cuando el usuario selecciona un resultado de la lista, Entonces su marcador se resalta, y viceversa.
- **HR-F006-AC5:** Dada una propiedad con precisión `approximate`, Cuando se muestra el mapa, Entonces su marcador se distingue de uno `exact` e indica que la posición es aproximada.
- **HR-F006-AC6:** Dados resultados sin pin, Cuando se muestra el mapa, Entonces no aparecen en él y la pantalla indica cuántos no se muestran.
- **HR-F006-AC7:** Dadas muchas propiedades cercanas, Cuando se aleja el zoom del mapa, Entonces se agrupan en clústeres que muestran su recuento y al acercar el zoom se separan.
- **HR-F006-AC8:** Dada un área seleccionada en el mapa, Cuando el usuario la confirma, Entonces la búsqueda muestra solo las propiedades cuyo pin está dentro del área.
- **HR-F006-AC9:** Dado el formulario de importación manual, Cuando el usuario coloca un pin y elige una precisión, Entonces el pin y la precisión se guardan y se derivan el municipio y la provincia.
- **HR-F006-AC10:** Dado un usuario que intenta guardar un pin sin elegir una precisión, Cuando lo envía, Entonces el pin no se guarda y el formulario solicita la precisión.
- **HR-F006-AC11:** Dado un adaptador de mapa sustituido por otra implementación del puerto, Cuando se usa la pantalla del mapa, Entonces su comportamiento no cambia.

## Casos límite

- Varias propiedades con el mismo pin (por ejemplo, un mismo edificio): se agrupan en clústeres y no pueden ocultarse unas a otras.
- Un pin fuera de todos los límites conocidos: se muestra y su municipio y provincia son desconocidos.
- No se pueden cargar las teselas del mapa: la lista de resultados sigue funcionando y la pantalla indica que el mapa no está disponible.
- Conjuntos de resultados sin ningún pin: el mapa se muestra vacío con su explicación.
- Una propiedad que cambia su pin: el marcador se mueve en la siguiente carga.
- Una selección de área que no abarca ninguna propiedad: se muestran cero resultados y se conserva el área.

## Fuera de alcance (MVP)

- Geocodificación de direcciones ([D18](/es/adr/d18-location-pin-declared-precision/)).
- Rutas a pie de calle, puntos de interés y datos de barrio.
- Dibujar varias áreas a la vez.

## Preguntas abiertas

- ¿Desplazar o acercar el mapa restringe automáticamente la lista de resultados al área visible, o solo lo hace una selección de área explícita?
- ¿Qué fuente de teselas del mapa se utiliza?

## Decisiones relacionadas

[D6](/es/adr/d06-persistence/), [D9](/es/adr/d09-map/), [D10](/es/adr/d10-cross-cutting-architecture/), [D12](/es/adr/d12-web-internationalization/), [D18](/es/adr/d18-location-pin-declared-precision/), [D19](/es/adr/d19-search-read-model/).
