---
title: Alcance del MVP
description: Priorización (P0, P1, P2) y alcance recomendado de la primera versión.
sidebar:
  order: 3
---

## Priorización

### P0: Core

Funcionalidades necesarias para que House Radar cumpla su propósito principal.

- Ingesta de anuncios.
- Normalización.
- Persistencia.
- Buscador y filtros.
- Fichas de propiedades.
- Enlace a la fuente original.
- Detección básica de duplicados.
- Histórico de precios.

### P1: Experiencia de usuario

Funcionalidades que hacen que la plataforma sea cómoda y útil en el día a día.

- Mapa interactivo.
- Favoritos.
- Búsquedas guardadas.
- Dashboard.
- Estadísticas por municipio.
- Gestión básica de usuarios.

### P2: Automatización

Funcionalidades que mejoran la operación y la recurrencia de uso.

- Alertas.
- Notificaciones.
- Administración avanzada.
- Monitorización de conectores.
- Reintentos y recuperación avanzada.

## Alcance recomendado de la primera versión

| Área | Alcance |
| --- | --- |
| Fuentes | Importación manual por URL + idealista API ([D3](/es/adr/d03-source-strategy/)) |
| Geografía | Galicia |
| Tipos de inmueble | Todos los soportados por la fuente |
| Backend | API completa |
| Frontend | Dashboard y buscador |
| Ingestion | Workers independientes |
| Base de datos | PostgreSQL + PostGIS |
| Usuarios | Un usuario o autenticación básica |
| IA | Ninguna inicialmente |
| Infraestructura | Docker Compose |
| Lenguaje | TypeScript de punta a punta ([D1](/es/adr/d01-language/)) |
| Repositorio | Monorepo `house-radar` ([D2](/es/adr/d02-repository-strategy/)) |
