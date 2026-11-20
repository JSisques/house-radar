---
title: "D8. Despliegue"
description: "Servidor propio con Docker Compose. Despliegue agnóstico de la plataforma: el mismo Compose debe poder moverse a un VPS sin cambios."
sidebar:
  order: 9
---

- **Estado:** Aceptada
- **Fecha:** 2026-11-20

## Contexto

La plataforma necesita un destino de despliegue para el MVP.

## Decisión

Servidor propio con Docker Compose. Despliegue agnóstico de la plataforma: el mismo Compose debe poder moverse a un VPS sin cambios.

## Consecuencias

- Servicios como Redis ([D7](/es/adr/d07-queues-and-scheduling/)) y el stack de observabilidad ([D15](/es/adr/d15-observability/)) se ejecutan como servicios de Docker Compose.
- El registro de decisiones no recoge más consecuencias para esta decisión.
