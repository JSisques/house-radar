---
title: "HR-F003: Buscador y filtros avanzados"
description: "El buscador es uno de los módulos centrales del producto."
sidebar:
  order: 3
---

## Resumen

El buscador es uno de los módulos centrales del producto. Los resultados son propiedades, no anuncios, y cada resultado muestra el precio representativo como «N anuncios, desde X €» ([D19](/es/adr/d19-search-read-model/)). El usuario combina filtros económicos, de superficie, de características y geográficos, y ordena los resultados.

## Prioridad

P0 (sección de origen 3).

## Módulos responsables

- `apps/api`, contexto delimitado `properties`: modelo de lectura de la búsqueda, consultas de filtrado y ordenación, consultas espaciales contra PostGIS.
- `apps/web`: pantalla de búsqueda, panel de filtros, lista de resultados y paginación.
- `packages/domain`: definiciones de filtros y ordenación compartidas por API y web.

## Dependencias

- [HR-F002](/es/features/hr-f002-normalization/): campos, ubicación y precio por metro cuadrado.
- [HR-F005](/es/features/hr-f005-duplicates/): los anuncios vinculados determinan cuántos anuncios tiene una propiedad.
- [HR-F006](/es/features/hr-f006-map/): selección de área en el mapa y sincronización con los resultados.
- [HR-F007](/es/features/hr-f007-favorites-saved-searches/): las búsquedas guardadas almacenan un conjunto de filtros.
- ADR: [D6](/es/adr/d06-persistence/), [D12](/es/adr/d12-web-internationalization/), [D14](/es/adr/d14-testing/), [D18](/es/adr/d18-location-pin-declared-precision/), [D19](/es/adr/d19-search-read-model/), [D20](/es/adr/d20-listing-consolidation-rules/).

## Historias de usuario

- Como usuario, quiero filtrar propiedades por precio, superficie, características y ubicación, para ver solo las viviendas que encajan con lo que busco.
- Como usuario, quiero ver cuántos anuncios tiene una propiedad y el precio más bajo, para encontrar la mejor oferta sin leer duplicados.
- Como usuario, quiero ordenar los resultados y conservar mis filtros al abrir una propiedad y volver, para no perder mi posición.

## Reglas de negocio

- **HR-F003-BR1:** los resultados de búsqueda son propiedades, no anuncios. Cada resultado muestra su precio representativo, el menor precio entre sus anuncios activos, como «N anuncios, desde X €» ([D19](/es/adr/d19-search-read-model/)).
- **HR-F003-BR2:** por defecto solo aparecen en los resultados las propiedades con al menos un anuncio activo; una propiedad sin anuncios activos no tiene precio representativo.
- **HR-F003-BR3:** los filtros económicos son precio mínimo, precio máximo y precio por metro cuadrado mínimo y máximo. Los filtros de precio se aplican al precio representativo.
- **HR-F003-BR4:** el precio por metro cuadrado usa únicamente la superficie construida. Las propiedades cuya superficie construida es desconocida se excluyen cuando hay un filtro de precio por metro cuadrado activo y nunca se emparejan mediante la superficie útil ([D20](/es/adr/d20-listing-consolidation-rules/)).
- **HR-F003-BR5:** los filtros de superficie son mínimo y máximo de superficie construida, útil y de terreno. Una propiedad cuyo valor para una superficie filtrada es desconocido no cumple ese filtro.
- **HR-F003-BR6:** los filtros de características son tipo de propiedad, número de habitaciones, número de baños, estado de conservación, propiedades para reformar, casas independientes, casas con terreno, propiedades con garaje y propiedades con jardín. Desconocido nunca se trata como «no»: una propiedad con garaje desconocido no cumple «con garaje».
- **HR-F003-BR7:** los filtros geográficos son comunidad autónoma, provincia, municipio, código postal, radio desde una ubicación y área seleccionada en el mapa. Comunidad autónoma, provincia y municipio son los valores derivados del pin ([D18](/es/adr/d18-location-pin-declared-precision/)); el código postal es el introducido a mano.
- **HR-F003-BR8:** los filtros de radio y de área del mapa usan el pin de la propiedad y se ejecutan como consultas espaciales en PostGIS ([D6](/es/adr/d06-persistence/)). Las propiedades sin pin no los cumplen.
- **HR-F003-BR9:** todos los filtros activos se combinan con AND.
- **HR-F003-BR10:** los resultados pueden ordenarse por precio ascendente, precio descendente, precio por metro cuadrado, superficie construida, superficie de terreno, fecha de incorporación y fecha de actualización. Las propiedades con valor de ordenación desconocido se colocan al final, sea cual sea la dirección elegida.
- **HR-F003-BR11:** la pantalla muestra el número de resultados, ofrece una acción que limpia todos los filtros y muestra los resultados por páginas.
- **HR-F003-BR12:** los filtros activos y el orden se conservan cuando el usuario abre la ficha de una propiedad y vuelve a los resultados.
- **HR-F003-BR13:** todas las etiquetas, formatos numéricos y formatos de moneda son español primero y traducibles ([D12](/es/adr/d12-web-internationalization/)).
- **HR-F003-BR14:** el filtro «propiedades a reformar» es el estado «a reformar»; «casas independientes» es el tipo de inmueble «casa independiente»; «casas con terreno» significa una superficie de parcela conocida y mayor que 0.
- **HR-F003-BR15:** los resultados se paginan, con 24 resultados por página. Los filtros activos y la página actual se reflejan en la URL.
- **HR-F003-BR16:** las propiedades sin anuncios activos se ocultan por defecto; un conmutador las incluye en los resultados.

## Criterios de aceptación

- **HR-F003-AC1:** Dada una propiedad con dos anuncios activos de 200 000 € y 190 000 €, Cuando el usuario busca, Entonces la propiedad aparece una sola vez mostrando «2 anuncios, desde 190 000 €».
- **HR-F003-AC2:** Dadas propiedades de 150 000 €, 200 000 € y 250 000 €, Cuando el usuario establece un precio mínimo de 200 000 € y un máximo de 250 000 €, Entonces solo se devuelven la segunda y la tercera propiedad.
- **HR-F003-AC3:** Dada una propiedad con superficie útil pero sin superficie construida, Cuando el usuario filtra por precio por metro cuadrado, Entonces la propiedad no se devuelve.
- **HR-F003-AC4:** Dada una propiedad cuyo único anuncio ha desaparecido, Cuando el usuario busca sin filtros, Entonces la propiedad no se devuelve.
- **HR-F003-AC5:** Dada una propiedad con garaje desconocido, Cuando el usuario filtra por «con garaje», Entonces la propiedad no se devuelve.
- **HR-F003-AC6:** Dados varios filtros activos, Cuando el usuario busca, Entonces solo se devuelven las propiedades que cumplen todos los filtros.
- **HR-F003-AC7:** Dada una ubicación y un radio de 10 km, Cuando el usuario aplica el filtro de radio, Entonces solo se devuelven las propiedades cuyo pin está a menos de 10 km y no se devuelven las que no tienen pin.
- **HR-F003-AC8:** Dado un polígono dibujado en el mapa, Cuando el usuario aplica el filtro de área, Entonces solo se devuelven las propiedades cuyo pin está dentro del polígono.
- **HR-F003-AC9:** Dados resultados ordenados por precio ascendente, Cuando algunas propiedades tienen un valor de ordenación desconocido, Entonces aparecen después de todas las que tienen un valor conocido.
- **HR-F003-AC10:** Dados filtros activos, Cuando el usuario abre una propiedad y vuelve a la búsqueda, Entonces se muestran los mismos filtros, orden y resultados.
- **HR-F003-AC11:** Dados filtros activos, Cuando el usuario limpia todos los filtros, Entonces no se aplica ningún filtro y el recuento de resultados se actualiza.
- **HR-F003-AC12:** Dados más resultados de los que caben en una página, Cuando el usuario llega al final de los resultados cargados, Entonces se cargan los siguientes sin repetir ni omitir ninguno.
- **HR-F003-AC13:** Dada una búsqueda sin coincidencias, Cuando se muestran los resultados, Entonces el recuento es cero y la pantalla ofrece limpiar los filtros.
- **HR-F003-AC14:** Dadas una propiedad con superficie de parcela 0 y otra con superficie de parcela desconocida, Cuando «casas con terreno» está activo, Entonces ninguna coincide.
- **HR-F003-AC15:** Dadas más de 24 propiedades coincidentes, Cuando se muestran los resultados, Entonces la primera página muestra 24 y la URL refleja los filtros y la página.
- **HR-F003-AC16:** Dada una URL con filtros y una página, Cuando se abre, Entonces se aplican los mismos filtros y la misma página.
- **HR-F003-AC17:** Dada una propiedad sin anuncios activos, Cuando el conmutador para incluirlas está desactivado, Entonces no aparece; Cuando está activado, Entonces aparece.

## Casos límite

- Mínimo mayor que máximo en un filtro de rango: la entrada se rechaza con un mensaje y no se ejecuta ninguna consulta.
- Un pin con precisión `municipality` cumple los filtros a nivel de municipio, pero no se trata como un punto preciso en los filtros de radio y de área del mapa.
- Una propiedad cambia (un anuncio desaparece o cambia su precio) mientras el usuario navega: la siguiente consulta refleja el nuevo estado; la página no se reordena en silencio mientras se muestra.
- La búsqueda por radio sin una ubicación elegida no está disponible.
- Una misma propiedad aparece una sola vez aunque varios de sus anuncios cumplan los filtros de forma distinta; la coincidencia usa los valores consolidados a nivel de propiedad.

## Fuera de alcance (MVP)

- Búsqueda de texto libre sobre títulos y descripciones.
- Búsqueda con IA ([fuera de alcance](/es/product/out-of-scope/)).
- Búsqueda de anuncios individuales: los resultados son siempre propiedades ([D19](/es/adr/d19-search-read-model/)).

## Decisiones relacionadas

[D6](/es/adr/d06-persistence/), [D12](/es/adr/d12-web-internationalization/), [D14](/es/adr/d14-testing/), [D18](/es/adr/d18-location-pin-declared-precision/), [D19](/es/adr/d19-search-read-model/), [D20](/es/adr/d20-listing-consolidation-rules/).
