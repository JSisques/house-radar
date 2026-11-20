---
title: "HR-F012: Administración y observabilidad"
description: "House Radar depende de procesos automáticos que pueden fallar. Es necesario poder comprobar su estado y diagnosticar problemas."
sidebar:
  order: 12
---

## Resumen

House Radar depende de procesos automáticos que pueden fallar. Esta funcionalidad permite comprobar su estado y diagnosticar problemas, mediante el stack de observabilidad y un área de administración. Según [D15](/es/adr/d15-observability/), los logs, las métricas, los health checks y las alertas son P1; las pantallas de administración de conectores y los reintentos avanzados son P2.

## Prioridad

P1/P2 (sección de origen 12):

- **P1:** logs estructurados, métricas de rendimiento, health checks de los servicios, alertas y el panel de jobs (Bull Board).
- **P2:** pantallas de administración del estado de los conectores, ejecuciones, errores, jobs pendientes, reintentos, habilitación de fuentes y estadísticas de ingesta.

## Módulos responsables

- `apps/ingestion`: jobs, conectores, métricas de ejecución y telemetría ([D7](/es/adr/d07-queues-and-scheduling/), [D15](/es/adr/d15-observability/)).
- `apps/api`, contexto delimitado `ingestion`: registros de ejecución, configuración de fuentes y endpoints de administración; `identity` protege el acceso.
- `apps/web`: área de administración (P2).
- `infra`: OpenTelemetry Collector, Prometheus, Loki, Tempo, Grafana y Bull Board en Docker Compose ([D8](/es/adr/d08-deployment/)).

## Dependencias

- [HR-F001](/es/features/hr-f001-ingestion/): ejecuciones, errores, reintentos y fuentes que se observan.
- [HR-F010](/es/features/hr-f010-users/): acceso autenticado al área de administración.
- [HR-F005](/es/features/hr-f005-duplicates/) y [HR-F008](/es/features/hr-f008-price-history/): umbrales configurables que la administración puede exponer.
- ADR: [D7](/es/adr/d07-queues-and-scheduling/), [D8](/es/adr/d08-deployment/), [D10](/es/adr/d10-cross-cutting-architecture/), [D13](/es/adr/d13-users-and-authentication/), [D15](/es/adr/d15-observability/), [D20](/es/adr/d20-listing-consolidation-rules/).

Consulta también la [visión general de operaciones](/es/operations/overview/).

## Historias de usuario

- Como administrador, quiero ver si cada conector funciona y cuándo se ejecutó por última vez, para detectar fallos pronto.
- Como administrador, quiero leer los errores y reintentar las ejecuciones fallidas, para recuperarme sin tocar el servidor.
- Como administrador, quiero logs, métricas y health checks, para diagnosticar problemas.

## Reglas de negocio

- **HR-F012-BR1 (P1):** los servicios escriben logs estructurados con Pino, correlacionados con las trazas, y los envían a Loki a través del OpenTelemetry Collector ([D15](/es/adr/d15-observability/)).
- **HR-F012-BR2 (P1):** los servicios exponen métricas de rendimiento, incluidas ejecuciones, duraciones, errores y profundidad de las colas, recogidas en Prometheus y visualizadas en Grafana.
- **HR-F012-BR3 (P1):** `apps/api` y `apps/ingestion` exponen health checks con `@nestjs/terminus` que informan del estado de sus dependencias (PostgreSQL y Redis).
- **HR-F012-BR4 (P1):** se definen alertas en Grafana para fallos de servicio y ejecuciones fallidas.
- **HR-F012-BR5 (P1):** los jobs pendientes, en ejecución y fallidos pueden inspeccionarse en Bull Board ([D7](/es/adr/d07-queues-and-scheduling/)).
- **HR-F012-BR6 (P2):** el área de administración muestra el estado de cada conector, sus últimas ejecuciones con resultado y recuentos, los anuncios procesados y los errores de extracción.
- **HR-F012-BR7 (P2):** el administrador puede reintentar una ejecución fallida y puede ver los jobs pendientes.
- **HR-F012-BR8 (P2):** el administrador puede habilitar y deshabilitar fuentes. Una fuente no puede habilitarse hasta haber revisado sus condiciones de uso ([HR-F001](/es/features/hr-f001-ingestion/)).
- **HR-F012-BR9 (P2):** el área de administración muestra estadísticas de ingesta por fuente: ejecuciones, anuncios descubiertos, actualizados, fallidos y tasa de errores.
- **HR-F012-BR10:** la administración y Bull Board solo son accesibles para un usuario autenticado ([D13](/es/adr/d13-users-and-authentication/)).
- **HR-F012-BR11:** los logs y las métricas nunca contienen contraseñas, tokens ni otros secretos.
- **HR-F012-BR12:** las herramientas de observabilidad se acceden mediante adaptadores, de modo que pueden sustituirse sin cambiar el código de la aplicación ([D10](/es/adr/d10-cross-cutting-architecture/)).
- **HR-F012-BR13 (P2):** el área de administración muestra los valores efectivos de la configuración operativa, como el número de ejecuciones sin ver un anuncio que lo marca como desaparecido (3 por defecto) ([D20](/es/adr/d20-listing-consolidation-rules/)).

## Criterios de aceptación

- **HR-F012-AC1 (P1):** Dada una petición atendida por la API, Cuando se procesa, Entonces se escribe una entrada de log estructurada con un identificador de traza.
- **HR-F012-AC2 (P1):** Dada una ejecución completada, Cuando se recogen las métricas, Entonces incluyen la ejecución, su duración y su resultado.
- **HR-F012-AC3 (P1):** Dado PostgreSQL inaccesible, Cuando se invoca el health check, Entonces informa del servicio como no saludable.
- **HR-F012-AC4 (P1):** Dadas todas las dependencias accesibles, Cuando se invoca el health check, Entonces informa de que está saludable.
- **HR-F012-AC5 (P1):** Dada una ejecución que ha fallado, Cuando se evalúan las reglas de alerta, Entonces se genera una alerta en Grafana.
- **HR-F012-AC6 (P1):** Dado un visitante no autenticado, Cuando solicita Bull Board, Entonces se deniega el acceso.
- **HR-F012-AC7 (P2):** Dados varios conectores, Cuando el administrador abre el área de administración, Entonces cada uno muestra su estado y su última ejecución.
- **HR-F012-AC8 (P2):** Dada una ejecución fallida, Cuando el administrador selecciona reintentar, Entonces se encola una nueva ejecución vinculada a la fallida.
- **HR-F012-AC9 (P2):** Dada una fuente sin condiciones revisadas, Cuando el administrador intenta habilitarla, Entonces permanece deshabilitada y se muestra el motivo.
- **HR-F012-AC10 (P2):** Dada una fuente habilitada, Cuando el administrador la deshabilita, Entonces no se inicia ninguna ejecución programada para ella.
- **HR-F012-AC11 (P2):** Dados errores de extracción, Cuando el administrador abre la vista de errores, Entonces cada error muestra su fuente, hora y causa.
- **HR-F012-AC12:** Dada una petición de inicio de sesión con una contraseña, Cuando se inspeccionan los logs, Entonces la contraseña no aparece.

## Casos límite

- Una ejecución en curso cuando se deshabilita su fuente: se completa y no se programa ninguna ejecución más.
- El stack de observabilidad está caído: las aplicaciones siguen funcionando y se acepta la pérdida de telemetría, con el problema visible en los health checks.
- Un reintento de una ejecución que ya tuvo éxito: se rechaza.
- Una tasa de errores muy alta en una fuente no detiene las demás fuentes.
- La cola está vacía: el área de administración muestra un estado vacío, no un error.

## Fuera de alcance (MVP)

- Las pantallas de administración (P2) no son necesarias para la primera versión; la cubren Bull Board y el stack de observabilidad.
- Varios roles de administrador y permisos por fuente.
- Planificación de capacidad y escalado automático.

## Preguntas abiertas

- ¿Es administrador cualquier usuario autenticado o existe un rol de administrador distinto?
- ¿Dónde se editan los ajustes operativos (umbral de desaparición, umbrales de duplicados): en la configuración del despliegue o en el área de administración?
- ¿Qué alertas se definen para la primera versión además de los fallos de servicio y las ejecuciones fallidas?

## Decisiones relacionadas

[D7](/es/adr/d07-queues-and-scheduling/), [D8](/es/adr/d08-deployment/), [D10](/es/adr/d10-cross-cutting-architecture/), [D13](/es/adr/d13-users-and-authentication/), [D15](/es/adr/d15-observability/), [D20](/es/adr/d20-listing-consolidation-rules/).
