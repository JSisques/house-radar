---
title: "D7. Colas y planificación"
description: "BullMQ + Redis (`@nestjs/bullmq`) para la ejecución de la ingestion."
sidebar:
  order: 8
---

- **Estado:** Aceptada
- **Fecha:** 2026-11-20

## Contexto

La ingestion se ejecuta periódicamente y debe gestionar errores temporales.

## Decisión

BullMQ + Redis (`@nestjs/bullmq`) para la ejecución de la ingestion.

## Consecuencias

- Ejecución periódica mediante jobs repetibles.
- Reintentos automáticos con backoff ante errores temporales.
- Estado de trabajos pendientes, fallidos y completados consultable mediante Bull Board, que cubre parte de la sección 12 (administración y observabilidad).
- Redis se añade como servicio en Docker Compose.
