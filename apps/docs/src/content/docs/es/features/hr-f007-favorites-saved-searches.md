---
title: "HR-F007: Favoritos y búsquedas guardadas"
description: "Permitir al usuario hacer seguimiento de propiedades y búsquedas de interés."
sidebar:
  order: 7
---

## Resumen

Los usuarios marcan propiedades como favoritas y guardan búsquedas con sus filtros para volver a ellas más tarde. Ambos pertenecen a un usuario y nunca son globales ([D13](/es/adr/d13-users-and-authentication/)).

## Prioridad

P1 (sección de origen 7).

## Módulos responsables

- `apps/api`, contexto delimitado `users`: favoritos y búsquedas guardadas propiedad de un usuario; la autenticación y el usuario actual proceden del contexto `identity`.
- `apps/web`: interruptor de favorito, lista de favoritos y pantallas de búsquedas guardadas.
- `packages/shared-kernel`: definiciones de filtros y ordenación que almacena una búsqueda guardada.

## Dependencias

- [HR-F010](/es/features/hr-f010-users/): el usuario autenticado propietario de los datos.
- [HR-F003](/es/features/hr-f003-search/): los filtros que una búsqueda guardada almacena y ejecuta.
- [HR-F004](/es/features/hr-f004-property-detail/): el interruptor de favorito en la ficha de la propiedad.
- [HR-F005](/es/features/hr-f005-duplicates/): fusionar propiedades afecta a los favoritos.
- [HR-F011](/es/features/hr-f011-notifications/): alertas por búsqueda guardada (posterior al MVP).
- ADR: [D12](/es/adr/d12-web-internationalization/), [D13](/es/adr/d13-users-and-authentication/), [D19](/es/adr/d19-search-read-model/).

## Historias de usuario

- Como usuario, quiero marcar propiedades como favoritas, para encontrarlas de nuevo rápidamente.
- Como usuario, quiero guardar una búsqueda con sus filtros, para repetirla sin volver a configurar los filtros.
- Como usuario, quiero editar o eliminar mis búsquedas guardadas, para que sigan ajustándose a lo que busco.

## Reglas de negocio

- **HR-F007-BR1:** los favoritos y las búsquedas guardadas pertenecen al usuario que los creó. Un usuario nunca ve ni modifica los favoritos o búsquedas de otro usuario ([D13](/es/adr/d13-users-and-authentication/)).
- **HR-F007-BR2:** un favorito hace referencia a una propiedad. Marcar una propiedad que ya es favorita no cambia nada; quitar un favorito no afecta a la propiedad.
- **HR-F007-BR3:** la lista de favoritos muestra los datos actuales de cada propiedad, incluidos su precio representativo y su estado. Un favorito sin anuncios activos permanece en la lista y se marca como ya no disponible.
- **HR-F007-BR4:** una búsqueda guardada almacena un nombre, sus filtros y su orden, incluida el área seleccionada en el mapa cuando la hay ([HR-F003](/es/features/hr-f003-search/)).
- **HR-F007-BR5:** las búsquedas guardadas pueden editarse (nombre, filtros, orden) y eliminarse. Editar o eliminar una nunca afecta a los favoritos ni a otras búsquedas guardadas.
- **HR-F007-BR6:** ver una búsqueda guardada la ejecuta con los datos actuales; los resultados nunca se almacenan, por lo que siempre reflejan el estado actual de las propiedades.
- **HR-F007-BR7:** cuando dos propiedades se vinculan como la misma propiedad ([HR-F005](/es/features/hr-f005-duplicates/)), el favorito de cualquiera de ellas sigue siendo favorito de la propiedad que permanece, sin duplicados.
- **HR-F007-BR8:** los textos de la interfaz son español primero y traducibles ([D12](/es/adr/d12-web-internationalization/)).
- **HR-F007-BR9:** los nombres de las búsquedas guardadas son únicos por usuario.

## Criterios de aceptación

- **HR-F007-AC1:** Dado un usuario autenticado en la ficha de una propiedad, Cuando la marca como favorita, Entonces aparece en su lista de favoritos.
- **HR-F007-AC2:** Dado un favorito, Cuando el usuario lo quita, Entonces ya no aparece en su lista de favoritos y la propiedad no se ve afectada.
- **HR-F007-AC3:** Dada una propiedad ya marcada como favorita, Cuando el usuario la marca de nuevo, Entonces sigue habiendo un único favorito.
- **HR-F007-AC4:** Dados dos usuarios, Cuando uno marca un favorito, Entonces la lista del otro usuario no cambia.
- **HR-F007-AC5:** Dado un favorito cuyos anuncios han desaparecido todos, Cuando el usuario abre la lista, Entonces el favorito se muestra como ya no disponible.
- **HR-F007-AC6:** Dada una búsqueda con filtros activos, Cuando el usuario la guarda con un nombre, Entonces aparece en sus búsquedas guardadas con esos filtros y orden.
- **HR-F007-AC7:** Dada una búsqueda guardada, Cuando el usuario edita sus filtros y guarda, Entonces la búsqueda guardada almacena los nuevos filtros.
- **HR-F007-AC8:** Dada una búsqueda guardada, Cuando el usuario la elimina, Entonces ya no aparece y los favoritos no se ven afectados.
- **HR-F007-AC9:** Dada una búsqueda guardada, Cuando el usuario la abre después de que hayan llegado anuncios nuevos, Entonces los resultados incluyen las propiedades que ahora coinciden.
- **HR-F007-AC10:** Dado un usuario que marcó como favoritas ambas propiedades que luego se vinculan como una, Cuando se realiza el vínculo, Entonces tiene un favorito de la propiedad que permanece.
- **HR-F007-AC11:** Dado un visitante no autenticado, Cuando solicita favoritos o búsquedas guardadas, Entonces se deniega el acceso.
- **HR-F007-AC12:** Dado un usuario con una búsqueda guardada llamada «Pisos Madrid», Cuando el usuario guarda o renombra otra búsqueda guardada con el mismo nombre, Entonces se rechaza con un mensaje.

## Casos límite

- Una búsqueda guardada cuyo filtro hace referencia a un valor que ya no existe (por ejemplo, un municipio eliminado): se ejecuta con los filtros restantes e indica al usuario qué filtro se ha ignorado.
- Una búsqueda guardada sin resultados: se muestran cero resultados y se conserva la búsqueda guardada.
- Guardar una búsqueda sin filtros: se permite y almacena el conjunto de filtros vacío.
- Un nombre muy largo: su longitud está limitada y se informa al usuario.
- Quitar un favorito dos veces seguidas: la segunda eliminación no tiene efecto y no se muestra ningún error.

## Fuera de alcance (MVP)

- Compartir favoritos o búsquedas guardadas con otros usuarios.
- Carpetas, etiquetas o notas en los favoritos.
- Alertas cuando una búsqueda guardada tiene resultados nuevos ([HR-F011](/es/features/hr-f011-notifications/), posterior al MVP).

## Decisiones relacionadas

[D12](/es/adr/d12-web-internationalization/), [D13](/es/adr/d13-users-and-authentication/), [D19](/es/adr/d19-search-read-model/).
