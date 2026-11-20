---
title: "HR-F011: Notificaciones y alertas"
description: "Automatización posterior a la primera versión de alertas para los usuarios."
sidebar:
  order: 11
---

:::note
Esta funcionalidad tiene prioridad P2 y es **posterior al MVP**: se especifica aquí para que el modelo deje espacio para ella, pero no forma parte de la primera versión.
:::

## Resumen

Automatización de alertas para los usuarios tras la primera versión: notificar anuncios nuevos, bajadas de precio y cambios importantes, configuradas por búsqueda guardada, con notificaciones dentro de la aplicación y correo electrónico preparado tras un puerto.

## Prioridad

P2 (sección de origen 11), tras la primera versión.

## Módulos responsables

- `apps/api`, un nuevo contexto delimitado `notifications` (propuesto; no figura en la lista de candidatos de [D4](/es/adr/d04-backend-framework/)): reglas de alerta, registros de notificación y entrega mediante puertos ([D10](/es/adr/d10-cross-cutting-architecture/)).
- `apps/ingestion`: evaluación programada de las reglas de alerta tras cada ejecución, como jobs de BullMQ ([D7](/es/adr/d07-queues-and-scheduling/)).
- `apps/web`: centro de notificaciones dentro de la aplicación y configuración de alertas.
- `infra`: configuración del adaptador de correo electrónico, cuando se habilite el correo.

## Dependencias

- [HR-F007](/es/features/hr-f007-favorites-saved-searches/): las alertas se configuran por búsqueda guardada y sobre favoritos.
- [HR-F008](/es/features/hr-f008-price-history/): las bajadas de precio y los cambios proceden de observaciones.
- [HR-F001](/es/features/hr-f001-ingestion/): los anuncios nuevos y las ejecuciones desencadenan la evaluación.
- [HR-F010](/es/features/hr-f010-users/): las notificaciones pertenecen al usuario autenticado y usan sus preferencias.
- ADR: [D7](/es/adr/d07-queues-and-scheduling/), [D10](/es/adr/d10-cross-cutting-architecture/), [D12](/es/adr/d12-web-internationalization/), [D13](/es/adr/d13-users-and-authentication/), [D19](/es/adr/d19-search-read-model/), [D20](/es/adr/d20-listing-consolidation-rules/).

## Historias de usuario

- Como usuario, quiero que me avisen cuando una propiedad nueva coincida con una búsqueda guardada, para no tener que revisar la búsqueda yo mismo.
- Como usuario, quiero que me avisen cuando una propiedad que sigo baje de precio, para poder actuar.
- Como usuario, quiero elegir con qué frecuencia me notifican, para no verme desbordado.

## Reglas de negocio

- **HR-F011-BR1:** las alertas se configuran por búsqueda guardada y pueden activarse o desactivarse de forma independiente.
- **HR-F011-BR2:** una alerta de «anuncio nuevo» se dispara cuando una propiedad empieza a coincidir con la búsqueda guardada desde la última evaluación.
- **HR-F011-BR3:** una alerta de «bajada de precio» se dispara cuando disminuye el precio representativo de una propiedad seguida (un favorito o una coincidencia de una alerta) ([D19](/es/adr/d19-search-read-model/), [D20](/es/adr/d20-listing-consolidation-rules/)).
- **HR-F011-BR4:** una alerta de «cambio importante» abarca cambios en anuncios registrados en el histórico; qué cambios se consideran importantes es configurable.
- **HR-F011-BR5:** el usuario configura la frecuencia de notificación por alerta.
- **HR-F011-BR6:** las notificaciones dentro de la aplicación solo están disponibles para el usuario propietario y pueden marcarse como leídas.
- **HR-F011-BR7:** las notificaciones por correo electrónico se preparan como un puerto de entrega sin adaptador obligatorio; habilitar un adaptador de correo no cambia las reglas anteriores ([D10](/es/adr/d10-cross-cutting-architecture/)).
- **HR-F011-BR8:** un mismo cambio nunca produce más de una notificación para la misma alerta.
- **HR-F011-BR9:** el texto de las notificaciones es español primero y traducible ([D12](/es/adr/d12-web-internationalization/)).

## Criterios de aceptación

- **HR-F011-AC1:** Dada una búsqueda guardada con una alerta de anuncio nuevo, Cuando aparece una propiedad nueva que coincide, Entonces se crea una notificación dentro de la aplicación para el propietario.
- **HR-F011-AC2:** Dado un favorito de 200 000 €, Cuando su precio representativo baja a 190 000 €, Entonces se crea una notificación de bajada de precio que muestra ambos precios.
- **HR-F011-AC3:** Dado un precio que sube, Cuando se registra el cambio, Entonces no se crea ninguna notificación de bajada de precio.
- **HR-F011-AC4:** Dada una alerta desactivada, Cuando se producen cambios coincidentes, Entonces no se crea ninguna notificación.
- **HR-F011-AC5:** Dada una frecuencia configurada, Cuando se producen cambios, Entonces las notificaciones se entregan según esa frecuencia.
- **HR-F011-AC6:** Dada una notificación ya creada para un cambio, Cuando las reglas se evalúan de nuevo, Entonces no se crea una segunda notificación para el mismo cambio.
- **HR-F011-AC7:** Dados dos usuarios, Cuando un cambio coincide con la alerta de uno de ellos, Entonces solo ese usuario ve la notificación.
- **HR-F011-AC8:** Dada una notificación sin leer, Cuando el usuario la marca como leída, Entonces se muestra como leída.
- **HR-F011-AC9:** Dado el puerto de correo sin adaptador, Cuando se dispara una alerta, Entonces se crea la notificación dentro de la aplicación y no se produce ningún error.

## Casos límite

- Una búsqueda guardada eliminada después de crear notificaciones: las notificaciones existentes se conservan y se marcan como procedentes de una búsqueda eliminada.
- Una propiedad que coincide, deja de coincidir y vuelve a coincidir: es una nueva coincidencia y puede notificar de nuevo.
- Muchos cambios en una sola ejecución: las notificaciones se agrupan según la frecuencia configurada.
- Un favorito cuyos anuncios desaparecen todos: puede producirse una notificación de cambio, una sola vez.
- Fallo de entrega por correo electrónico: se reintenta según la política de la cola y nunca bloquea las notificaciones dentro de la aplicación.

## Fuera de alcance (MVP)

- Todo lo de esta funcionalidad queda fuera de la primera versión.
- Notificaciones push y canales de mensajería distintos de la aplicación y el correo electrónico.
- Alertas basadas en predicción o recomendación ([fuera de alcance](/es/product/out-of-scope/)).

## Preguntas abiertas

- ¿Qué frecuencias se ofrecen (por ejemplo, inmediata y resumen periódico)?
- ¿Qué cambios en los anuncios se consideran «importantes»?
- ¿Deben las comprobaciones manuales del propio usuario generar notificaciones para ese mismo usuario?

## Decisiones relacionadas

[D7](/es/adr/d07-queues-and-scheduling/), [D10](/es/adr/d10-cross-cutting-architecture/), [D12](/es/adr/d12-web-internationalization/), [D13](/es/adr/d13-users-and-authentication/), [D19](/es/adr/d19-search-read-model/), [D20](/es/adr/d20-listing-consolidation-rules/).
