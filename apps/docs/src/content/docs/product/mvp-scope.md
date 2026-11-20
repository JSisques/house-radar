---
title: MVP scope
description: Prioritization (P0, P1, P2) and the recommended scope of the first version.
sidebar:
  order: 3
---

## Prioritization

### P0: Core

Features required for House Radar to fulfill its main purpose.

- Listing ingestion.
- Normalization.
- Persistence.
- Search and filters.
- Property detail pages.
- Link to the original source.
- Basic duplicate detection.
- Price history.

### P1: User experience

Features that make the platform comfortable and useful day to day.

- Interactive map.
- Favorites.
- Saved searches.
- Dashboard.
- Statistics by municipality.
- Basic user management.

### P2: Automation

Features that improve operation and recurring use.

- Alerts.
- Notifications.
- Advanced administration.
- Connector monitoring.
- Advanced retries and recovery.

## Recommended scope of the first version

| Area | Scope |
| --- | --- |
| Sources | Manual URL import + idealista API ([D3](/adr/d03-source-strategy/)) |
| Geography | Galicia |
| Property types | All those supported by the source |
| Backend | Complete API |
| Frontend | Dashboard and search |
| Ingestion | Independent workers |
| Database | PostgreSQL + PostGIS |
| Users | A single user or basic authentication |
| AI | None initially |
| Infrastructure | Docker Compose |
| Language | TypeScript end to end ([D1](/adr/d01-language/)) |
| Repository | `house-radar` monorepo ([D2](/adr/d02-repository-strategy/)) |
