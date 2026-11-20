---
title: "HR-F002: Gestión y normalización de propiedades"
description: "Todos los anuncios deben convertirse a un modelo común, independientemente de su origen."
sidebar:
  order: 2
---

## Resumen

Todos los anuncios se convierten a un modelo común, independientemente de su origen. El modelo separa la propiedad real de los anuncios publicados sobre ella, registra la procedencia de cada dato, admite valores desconocidos y distingue datos declarados, calculados e inferidos. Consulta el [lenguaje ubicuo](/es/domain/ubiquitous-language/).

## Prioridad

P0 (sección de origen 2).

## Módulos responsables

- `packages/domain`: modelo normalizado, objetos de valor (precio, superficie, ubicación con precisión) y tipos de dato.
- `apps/api`, contextos delimitados `listings` (anuncio, observaciones, estado) y `properties` (propiedad, consolidación de atributos, ubicación).
- `apps/ingestion`: mapeo de la carga de cada conector al modelo normalizado.
- `apps/web`: formulario de entrada manual, incluido el pin de ubicación.

## Dependencias

- [HR-F001](/es/features/hr-f001-ingestion/): aporta los datos en bruto que hay que normalizar.
- [HR-F005](/es/features/hr-f005-duplicates/): vincula anuncios con propiedades.
- [HR-F006](/es/features/hr-f006-map/): usa la ubicación y su precisión.
- ADR: [D1](/es/adr/d01-language/), [D2](/es/adr/d02-repository-strategy/), [D6](/es/adr/d06-persistence/), [D12](/es/adr/d12-web-internationalization/), [D18](/es/adr/d18-location-pin-declared-precision/), [D19](/es/adr/d19-search-read-model/), [D20](/es/adr/d20-listing-consolidation-rules/).

## Historias de usuario

- Como usuario, quiero que cada propiedad se describa con los mismos campos, para poder comparar viviendas de distintas fuentes.
- Como usuario, quiero que los datos desconocidos sigan siendo desconocidos, para no confundir nunca un dato ausente con una característica ausente.
- Como usuario, quiero colocar un pin en un mapa e indicar su precisión, para que la ubicación sea honesta sobre su exactitud.
- Como usuario, quiero ver cuándo las fuentes discrepan sobre una propiedad, para poder juzgar qué valor creer.

## Reglas de negocio

- **HR-F002-BR1:** todo anuncio se normaliza a un modelo común, sea cual sea su fuente. El modelo se comparte mediante `packages/domain` ([D1](/es/adr/d01-language/), [D2](/es/adr/d02-repository-strategy/)).
- **HR-F002-BR2:** los campos generales son título, descripción, precio, superficie construida, superficie útil, superficie de terreno, número de habitaciones, número de baños, tipo de propiedad, estado de conservación y año de construcción cuando esté disponible.
- **HR-F002-BR3:** las características adicionales son garaje, jardín, piscina, terraza, balcón, calefacción, ascensor, certificado energético, tipo de suelo, agua, electricidad y saneamiento.
- **HR-F002-BR4:** todo campo admite un valor desconocido. La ausencia de un dato nunca significa que la propiedad carezca de esa característica, y los valores desconocidos nunca se infieren sin indicarlo.
- **HR-F002-BR5:** todo dato tiene un tipo: declarado (indicado por el anunciante o introducido por el usuario), calculado (derivado de forma determinista) o inferido (siempre marcado como tal).
- **HR-F002-BR6:** un anuncio registra su portal de origen, URL original, identificador externo, fecha de publicación si se conoce, fecha de incorporación, fecha de última comprobación y estado (`active`, `disappeared` o `unknown`).
- **HR-F002-BR7:** la ubicación de una propiedad es un pin con una precisión declarada: `exact`, `approximate` o `municipality`. El municipio y la provincia se derivan del pin mediante punto en polígono contra los límites oficiales del IGN en PostGIS; el código postal se introduce a mano ([D18](/es/adr/d18-location-pin-declared-precision/)).
- **HR-F002-BR8:** el precio por metro cuadrado es un dato calculado que usa únicamente la superficie construida. Si se desconoce la superficie construida, es desconocido; nunca se recurre a la superficie útil ([D20](/es/adr/d20-listing-consolidation-rules/)).
- **HR-F002-BR9:** cuando los anuncios de una propiedad discrepan en un atributo, la propiedad muestra el valor observado más reciente y señala el conflicto con cada valor y su fuente ([D20](/es/adr/d20-listing-consolidation-rules/)).
- **HR-F002-BR10:** la propiedad expone un precio representativo, el menor precio entre sus anuncios activos; sin anuncios activos no tiene ninguno ([D19](/es/adr/d19-search-read-model/)).
- **HR-F002-BR11:** los precios se expresan en euros y las superficies en metros cuadrados. Las etiquetas y formatos de cara al usuario son español primero y traducibles ([D12](/es/adr/d12-web-internationalization/)).

## Criterios de aceptación

- **HR-F002-AC1:** Dadas cargas de dos fuentes distintas, Cuando se normalizan, Entonces ambas producen anuncios con el mismo conjunto de campos.
- **HR-F002-AC2:** Dado un anuncio que no indica el año de construcción, Cuando se normaliza, Entonces el año es desconocido y no cero ni texto vacío.
- **HR-F002-AC3:** Dado un anuncio con 100 m² construidos y un precio de 200 000 €, Cuando se muestra la propiedad, Entonces el precio por metro cuadrado es 2 000 €/m² y está marcado como calculado.
- **HR-F002-AC4:** Dado un anuncio con superficie útil pero sin superficie construida, Cuando se solicita el precio por metro cuadrado, Entonces el valor es desconocido.
- **HR-F002-AC5:** Dado un pin colocado dentro del límite de un municipio, Cuando se guarda la ubicación, Entonces el municipio y la provincia se derivan y se almacenan junto con el pin y su precisión.
- **HR-F002-AC6:** Dado un pin fuera de todos los límites conocidos, Cuando se guarda la ubicación, Entonces el municipio y la provincia siguen siendo desconocidos y se conserva el pin.
- **HR-F002-AC7:** Dados dos anuncios de una propiedad con superficies construidas de 100 m² y 105 m², Cuando se muestra la propiedad, Entonces muestra el valor del anuncio observado más recientemente y señala el conflicto, enumerando cada valor con su fuente.
- **HR-F002-AC8:** Dada una propiedad con dos anuncios activos de 200 000 € y 190 000 €, Cuando se lee la propiedad, Entonces su precio representativo es 190 000 €.
- **HR-F002-AC9:** Dado un anuncio que desaparece, Cuando cambia su estado, Entonces se conservan las observaciones anteriores y el anuncio deja de contar para el precio representativo.
- **HR-F002-AC10:** Dado un anuncio nuevo, Cuando se guarda, Entonces se registran su fuente, URL original, fecha de incorporación y fecha de última comprobación.

## Casos límite

- Datos contradictorios dentro de un mismo anuncio (por ejemplo, superficie útil mayor que la construida): los valores se almacenan tal como se declaran y no se corrigen en silencio.
- Los precios y superficies negativos o cero se rechazan como entrada no válida; un valor desconocido se representa como desconocido, no como cero.
- Un pin con precisión `municipality` se muestra y filtra solo por municipio, nunca como un punto.
- Un anuncio sin pin tiene ubicación desconocida y se excluye de los filtros espaciales.
- Mover un pin recalcula el municipio y la provincia.
- Desaparecen todos los anuncios de una propiedad: la propiedad se conserva, no tiene precio representativo y mantiene su histórico.

## Fuera de alcance (MVP)

- Geocodificación de direcciones ([D18](/es/adr/d18-location-pin-declared-precision/)).
- Inferir características ausentes a partir de descripciones o fotografías.
- Datos del Catastro y estimación automática del valor de mercado.

## Preguntas abiertas

- ¿Son el tipo de propiedad y el estado de conservación listas cerradas y cuáles son sus valores?
- ¿Qué valores admite el certificado energético, incluidos «no disponible» y «en trámite»?

## Decisiones relacionadas

[D1](/es/adr/d01-language/), [D2](/es/adr/d02-repository-strategy/), [D6](/es/adr/d06-persistence/), [D12](/es/adr/d12-web-internationalization/), [D18](/es/adr/d18-location-pin-declared-precision/), [D19](/es/adr/d19-search-read-model/), [D20](/es/adr/d20-listing-consolidation-rules/).
