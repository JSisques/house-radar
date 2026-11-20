---
title: Visión general de operaciones
description: Despliegue, observabilidad y alertas. Las secciones sin contenido en el documento de origen se marcan como por definir.
sidebar:
  order: 1
---

## Despliegue

Decisión [D8](/es/adr/d08-deployment/): servidor propio con Docker Compose. El despliegue es agnóstico de la plataforma: el mismo Compose debe poder moverse a un VPS sin cambios.

Servicios del Compose: PostgreSQL + PostGIS, Redis, OpenTelemetry Collector, Prometheus, Loki, Tempo y Grafana (véase la [visión general de la arquitectura](/es/architecture/overview/)).

Los entornos, el procedimiento de despliegue en staging y los secretos se describen en [Entornos y despliegue](/es/operations/environments/) ([D35](/es/adr/d35-environments-and-staging-deployment/)). La producción aún no está definida.

## Observabilidad

Decisión [D15](/es/adr/d15-observability/): stack completo desde el MVP.

- OpenTelemetry (Collector) hacia Prometheus (métricas), Loki (logs) y Tempo (trazas).
- Grafana para dashboards y alertas.
- Logs estructurados con Pino.
- Health checks con `@nestjs/terminus`.
- Bull Board para el estado de los jobs.

La instrumentación se hace con OpenTelemetry detrás de un adaptador, de modo que los backends son intercambiables.

## Alertas

Alertas en Grafana, como mínimo, para:

- Ingestion sin ejecuciones exitosas en un periodo configurable.
- Tasa de errores de extracción.
- Health checks caídos.

Umbrales y canales de notificación: **por definir.**

## Runbooks de ingestion

**Por definir.**

## Copias de seguridad y recuperación

Requisito de producción, que se define junto con la producción. Los datos de staging son desechables y no tienen copias de seguridad ([D35](/es/adr/d35-environments-and-staging-deployment/)).
