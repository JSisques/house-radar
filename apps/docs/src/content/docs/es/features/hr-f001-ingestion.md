---
title: "HR-F001: Recopilación de anuncios (ingestion)"
description: "El sistema debe incorporar propiedades desde diferentes fuentes, mediante conectores independientes."
sidebar:
  order: 1
---

## Resumen

El sistema incorpora anuncios a House Radar desde diferentes fuentes mediante conectores independientes. Los conectores automáticos se ejecutan periódicamente; la fuente provisional del MVP es un formulario de importación manual ([D17](/es/adr/d17-manual-import-assisted-form/)). Solo se utilizan fuentes autorizadas ([D3](/es/adr/d03-source-strategy/)).

## Prioridad

P0 (sección de origen 1).

## Módulos responsables

- `apps/ingestion`: conectores (uno por fuente), ejecuciones programadas, reintentos y registros de ejecución.
- `apps/api`, contextos delimitados `ingestion` (fuentes, ejecuciones, caso de uso de importación manual) y `listings` (identidad de anuncios y observaciones).
- `apps/web`: formulario de importación manual y la acción «comprobar anuncio».
- `packages/shared-kernel`: modelo normalizado de anuncio compartido por los módulos anteriores.

## Dependencias

- [HR-F002](/es/features/hr-f002-normalization/): todo anuncio ingerido se convierte al modelo normalizado.
- [HR-F008](/es/features/hr-f008-price-history/): las ejecuciones y comprobaciones manuales crean las observaciones con las que se construye el histórico.
- [HR-F012](/es/features/hr-f012-admin-observability/): el estado de las ejecuciones, los errores y los reintentos se muestran al administrador.
- [Concurrencia de la ingesta](/es/architecture/ingestion-concurrency/): cómo escalan los workers sin colisiones.
- ADR: [D3](/es/adr/d03-source-strategy/), [D7](/es/adr/d07-queues-and-scheduling/), [D10](/es/adr/d10-cross-cutting-architecture/), [D17](/es/adr/d17-manual-import-assisted-form/), [D20](/es/adr/d20-listing-consolidation-rules/), [D23](/es/adr/d23-ingestion-concurrency-model/), [D37](/es/adr/d37-fotocasa-detail-connector/).

## Historias de usuario

- Como usuario, quiero registrar un anuncio que he encontrado pegando su URL y rellenando un formulario, para poder seguirlo sin ningún scraping.
- Como usuario, quiero que los anuncios nuevos de fuentes autorizadas aparezcan automáticamente, para no tener que buscar en cada portal a mano.
- Como usuario, quiero registrar que he vuelto a comprobar un anuncio manual, para que su precio y su estado estén al día.
- Como administrador, quiero que las ejecuciones fallidas se reintenten y se registren, para que los problemas temporales no hagan perder datos.

## Reglas de negocio

- **HR-F001-BR1:** cada fuente tiene su propio conector tras un puerto ([D10](/es/adr/d10-cross-cutting-architecture/)). Los conectores son independientes: un fallo o un cambio en uno nunca afecta a otro.
- **HR-F001-BR2:** solo se utilizan fuentes autorizadas. Un conector no se habilita hasta haber revisado las condiciones de uso, la API o los permisos del feed de su fuente; nunca se usa scraping no autorizado ([D3](/es/adr/d03-source-strategy/)).
- **HR-F001-BR3:** las fuentes automáticas objetivo son la idealista Search API (pendiente de la clave de acceso) y los feeds autorizados de inmobiliarias locales de Santiago, en ese orden. Hasta que se conceda una clave, la importación manual es la única fuente activa.
- **HR-F001-BR4:** la importación manual es un formulario asistido. La URL se guarda como procedencia y como enlace al anuncio original y nunca se descarga; todos los datos se introducen a mano ([D17](/es/adr/d17-manual-import-assisted-form/)).
- **HR-F001-BR5:** un anuncio se identifica de forma única por su fuente y su identificador externo dentro de esa fuente. Ingerir una identidad que ya existe actualiza ese anuncio y nunca crea un segundo.
- **HR-F001-BR6:** los conectores automáticos se ejecutan periódicamente como jobs repetibles de BullMQ ([D7](/es/adr/d07-queues-and-scheduling/)). Cada ejecución descubre anuncios nuevos y vuelve a comprobar los conocidos.
- **HR-F001-BR7:** cada ejecución registra su inicio, fin, resultado y los recuentos de anuncios descubiertos, actualizados, sin cambios y fallidos, y se controlan los anuncios ya procesados para no importarlos dos veces.
- **HR-F001-BR8:** los errores temporales se reintentan automáticamente con backoff; los errores permanentes no se reintentan. Todo error de extracción se registra con su fuente, la identidad del anuncio si se conoce y la causa.
- **HR-F001-BR9:** toda ejecución que ve un anuncio registra una observación y actualiza su fecha de última comprobación. Un anuncio no visto en N ejecuciones consecutivas se marca como `disappeared` (N es configurable, 3 por defecto) ([D20](/es/adr/d20-listing-consolidation-rules/)).
- **HR-F001-BR10:** las imágenes solo se almacenan o muestran cuando las condiciones de la fuente lo permiten; en caso contrario solo se conserva el enlace al anuncio original.
- **HR-F001-BR11:** los anuncios manuales no tienen comprobaciones automáticas de estado. El usuario registra una nueva observación con «comprobar anuncio» (precio, sigue activo, fecha de comprobación) o marca el anuncio como `disappeared` ([D20](/es/adr/d20-listing-consolidation-rules/)).
- **HR-F001-BR12:** todo anuncio ingerido registra su fuente, URL original, identificador externo si se conoce, fecha de incorporación y fecha de última actualización.
- **HR-F001-BR13:** un anuncio manual sin identificador externo recibe un UUID interno como identidad.
- **HR-F001-BR14:** al importar un anuncio manual, su URL se normaliza eliminando la cadena de consulta (query string) y el fragmento. Volver a importar una URL cuya forma normalizada coincide con un anuncio manual existente avisa al usuario y le ofrece «comprobar anuncio» en lugar de crear un anuncio nuevo.
- **HR-F001-BR15:** las fuentes automáticas se ejecutan una vez al día por defecto.
- **HR-F001-BR16:** los errores temporales se reintentan 3 veces con espera exponencial (backoff) por defecto.
- **HR-F001-BR17:** la frecuencia de ejecución, el número de reintentos y el backoff son configurables.
- **HR-F001-BR18:** las fotos subidas por el usuario a un anuncio manual quedan fuera del alcance del MVP (post-MVP).

## Criterios de aceptación

- **HR-F001-AC1:** Dado un usuario en el formulario de importación manual, Cuando envía una URL y los campos obligatorios, Entonces se crea un anuncio con la URL guardada como procedencia y no se realiza ninguna petición a la URL.
- **HR-F001-AC2:** Dada una importación manual a la que le falta un campo obligatorio, Cuando el usuario la envía, Entonces no se crea ningún anuncio y el formulario indica qué campos faltan.
- **HR-F001-AC3:** Dado un anuncio que ya existe para una fuente y un identificador externo, Cuando una ingesta entrega la misma identidad, Entonces se actualiza el anuncio existente y no se crea uno nuevo.
- **HR-F001-AC4:** Dada una fuente automática habilitada, Cuando comienza su ejecución programada, Entonces se crea un registro de ejecución con su hora de inicio y, al terminar, su resultado y recuentos.
- **HR-F001-AC5:** Dada una ejecución en la que la fuente devuelve un error temporal, Cuando se reintenta y después tiene éxito, Entonces la ejecución termina correctamente y el reintento queda registrado.
- **HR-F001-AC6:** Dada una ejecución que falla con un error permanente, Cuando se detecta el fallo, Entonces el error se registra con su fuente y causa y la ejecución no se reintenta.
- **HR-F001-AC7:** Dado un anuncio activo de una fuente automática, Cuando está ausente en N ejecuciones consecutivas, Entonces su estado pasa a `disappeared`; con menos de N ausencias su estado sigue siendo `active`.
- **HR-F001-AC8:** Dado un anuncio manual activo, Cuando el usuario ejecuta «comprobar anuncio» con un precio nuevo, Entonces se registra una observación con el nuevo precio, el estado y la fecha de comprobación, y se actualiza la fecha de última comprobación.
- **HR-F001-AC9:** Dada una fuente cuyas condiciones no permiten almacenar imágenes, Cuando se ingiere un anuncio, Entonces no se almacena ninguna imagen y se conserva el enlace al anuncio original.
- **HR-F001-AC10:** Dada una fuente que no ha sido autorizada, Cuando un administrador intenta habilitarla, Entonces permanece deshabilitada.
- **HR-F001-AC11:** Dado un anuncio manual sin identificador externo, Cuando se guarda, Entonces recibe un UUID interno como identidad.
- **HR-F001-AC12:** Dado un anuncio manual existente con URL `https://example.com/home/1?ref=a#photos`, Cuando el usuario importa `https://example.com/home/1`, Entonces se avisa al usuario y se le ofrece «comprobar anuncio», y no se crea ningún anuncio nuevo.
- **HR-F001-AC13:** Dada una fuente automática con la configuración por defecto, Cuando se produce un error temporal, Entonces la operación se reintenta hasta 3 veces con espera exponencial.
- **HR-F001-AC14:** Dada una fuente automática con la configuración por defecto, Cuando ha pasado un día desde su última ejecución, Entonces se inicia una nueva ejecución.
- **HR-F001-AC15:** Dados una frecuencia, un número de reintentos o un backoff modificados en la configuración, Cuando se programa la siguiente ejecución, Entonces se aplican los nuevos valores.

## Casos límite

- Importar una URL que ya está guardada para un anuncio manual: se avisa al usuario y se le ofrece el anuncio existente en lugar de crear otro en silencio.
- Un anuncio manual cuyo identificador externo se desconoce: se identifica internamente y aun así puede emparejarse mediante la detección de duplicados ([HR-F005](/es/features/hr-f005-duplicates/)).
- Una fuente devuelve un resultado vacío: cuenta como una ejecución en la que no se vio ningún anuncio, por lo que las ausencias se acumulan; el administrador puede verlo en el registro de ejecución.
- Una ejecución se interrumpe a medias: los anuncios procesados no se pierden y la siguiente ejecución continúa con normalidad.
- Una fuente cambia su formato de respuesta: los anuncios afectados fallan con un error registrado y las demás fuentes no se ven afectadas.
- Un anuncio `disappeared` vuelve a verse: pasa a `active` y se registra la observación.

## Fuera de alcance (MVP)

- Extraer cualquier contenido de la página que hay tras una URL manual.
- Hacer scraping de portales sin autorización.
- Importar desde varias fuentes automáticas a la vez (solo la importación manual está activa hasta que se conceda la clave de idealista).

## Decisiones relacionadas

[D3](/es/adr/d03-source-strategy/), [D7](/es/adr/d07-queues-and-scheduling/), [D10](/es/adr/d10-cross-cutting-architecture/), [D17](/es/adr/d17-manual-import-assisted-form/), [D20](/es/adr/d20-listing-consolidation-rules/), [D23](/es/adr/d23-ingestion-concurrency-model/), [D28](/es/adr/d28-bounded-context-map/), [D31](/es/adr/d31-transactional-outbox/), [D37](/es/adr/d37-fotocasa-detail-connector/).

Véase también: [Mapa de contextos](/es/architecture/context-map/), [Esquema de base de datos](/es/architecture/database-schema/).
