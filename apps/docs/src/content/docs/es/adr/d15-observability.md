---
title: "D15. Observabilidad"
description: "Stack completo desde el MVP: OpenTelemetry (Collector) → Prometheus (métricas), Loki (logs), Tempo (trazas) y Grafana (dashboards y alertas)"
sidebar:
  order: 16
---

- **Estado:** Aceptada
- **Fecha:** 2026-11-20

## Contexto

House Radar depende de procesos automáticos que pueden fallar, por lo que su estado debe poder comprobarse y los problemas diagnosticarse.

## Decisión

Stack completo desde el MVP: OpenTelemetry (Collector) → Prometheus (métricas), Loki (logs), Tempo (trazas) y Grafana (dashboards y alertas). Logs estructurados con Pino, health checks con `@nestjs/terminus` y Bull Board para jobs.

## Consecuencias

- La instrumentación se hace con OpenTelemetry detrás de un adaptador ([D10](/es/adr/d10-cross-cutting-architecture/)); los backends de observabilidad son intercambiables.
- Docker Compose incluye OTel Collector, Prometheus, Loki, Tempo y Grafana.
- Alertas en Grafana como mínimo para: ingestion sin ejecuciones exitosas en un periodo configurable, tasa de errores de extracción y health checks caídos.
- La sección 12 (administración y observabilidad) pasa a P1 en lo relativo a logs, métricas, health checks y alertas.
