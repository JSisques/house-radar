---
title: Entornos y despliegue
description: Entornos, el despliegue automático en staging con health checks y rollback, secretos por nombre, alojamiento de la documentación y lo que sigue sin definir para producción.
sidebar:
  order: 2
---

Decisiones: [D35](/es/adr/d35-environments-and-staging-deployment/) (entornos y despliegue en staging) y [D36](/es/adr/d36-docs-hosting-cloudflare-pages/) (alojamiento de la documentación).

## Entornos

| Entorno | Dónde | Acceso | Desde |
| --- | --- | --- | --- |
| Local | Máquina del desarrollador, Docker Compose | localhost | M0 |
| CI | GitHub Actions + Testcontainers | Solo el pipeline | M0 |
| Staging | Servidor propio | Red privada (Tailscale) | M4 |
| Producción | Por definir (alojamiento público) | Internet, dominio y TLS | Cuando se publique el producto |

Staging se expone solo dentro de la red privada de Tailscale: el servidor no tiene puertos públicos. Los datos de staging son desechables: se pueden borrar y regenerar, y las migraciones destructivas son aceptables allí, nunca en producción.

## Entorno local

Requiere Docker. Desde la raíz del repositorio:

```sh
cp .env.example .env   # opcional: los valores por defecto funcionan sin él
pnpm infra:up          # arranca PostgreSQL + PostGIS y Redis, y espera a que estén healthy
pnpm infra:down        # detiene los contenedores; los volúmenes de datos persisten
```

Los puertos del host son altos y poco comunes para evitar choques con otros contenedores locales: PostgreSQL `55432` y Redis `56379`. Se pueden cambiar con `POSTGRES_PORT` y `REDIS_PORT` en `.env`.

Los datos viven en los volúmenes con nombre `postgres-data` y `redis-data`. Para borrarlos, ejecuta `docker compose down -v`.

## Despliegue en staging

Las imágenes se construyen en GitHub Actions y se publican en GitHub Container Registry, etiquetadas con el SHA del commit. Cada merge a `main` dispara este flujo:

1. El workflow se une a la tailnet con la GitHub Action de Tailscale, usando una clave de autenticación efímera y etiquetada, restringida por ACL al servidor de staging.
2. Se conecta por SSH con una clave de despliegue restringida y escribe el `.env` del servidor (modo `600`) a partir de los secretos del GitHub Environment `staging`.
3. Las migraciones se ejecutan primero, en un contenedor efímero con la nueva imagen. Si fallan, el despliegue se detiene y la versión anterior sigue en marcha.
4. `docker compose pull && docker compose up -d --wait` levanta el nuevo SHA. Compose espera a que todos los servicios bloqueantes estén `healthy`; un timeout hace fallar el comando.
5. Un smoke test de extremo a extremo envía una petición a través de la web hasta la API y confirma que el SHA servido es el nuevo.
6. Ante cualquier fallo, el workflow vuelve a desplegar el último SHA sano y termina en rojo.

Los merges consecutivos se despliegan uno tras otro: un grupo `concurrency` de Actions por entorno evita despliegues solapados.

## Imágenes de contenedor

El workflow `publish-images` construye una imagen por servicio (`api`, `ingestion`, `web`) desde `apps/<servicio>/Dockerfile`, con la raíz del repositorio como contexto, y la publica en `ghcr.io/<owner>/house-radar-<servicio>`.

| Disparador | Etiquetas |
| --- | --- |
| Push a `main` | `sha-<commit>` |
| Tag de release `v0.3.0` | `0.3.0` y `sha-<commit>` |

Para construir una en local: `docker build -f apps/web/Dockerfile --build-arg GIT_SHA=$(git rev-parse HEAD) .`. La imagen `web` sirve `/version.json` con el commit del que se construyó. La imagen del outbox relay se sigue en [#187](https://github.com/JSisques/house-radar/issues/187).

## Health checks

Cada servicio declara su propio healthcheck de Docker Compose. Las mismas comprobaciones funcionan en local.

| Servicio | Comprobación | Bloquea el despliegue |
| --- | --- | --- |
| `postgres` | `pg_isready` y extensión PostGIS disponible | Sí |
| `redis` | `PING` | Sí |
| `api` | `/health` (terminus): Postgres, Redis, migraciones al día | Sí |
| `ingestion` | `/health` propio: conexiones a Redis y al worker de BullMQ | Sí |
| Relay del outbox | `/health` propio: puede leer el outbox y publicar en BullMQ | Sí |
| `web` | Sirve `index.html` y expone la versión desplegada (`/version.json` con el SHA) | Sí |
| Observabilidad (Grafana, Prometheus, Loki, Tempo, OTel Collector) | Endpoints de readiness | No, solo aviso |

La observabilidad no bloquea: un Grafana lento no debe provocar el rollback de una aplicación sana. Las [alertas](/es/operations/overview/) cubren el resto.

## Rollback

El servidor conserva el SHA de la última versión sana. Si la nueva versión falla en las migraciones, los health checks o el smoke test, el workflow vuelve a desplegar ese SHA y termina en rojo, de modo que GitHub avisa de que el merge rompió staging.

## Secretos

Los secretos viven en el GitHub Environment `staging`, la única fuente de verdad. Cambiar un secreto significa editarlo en GitHub y volver a desplegar; recrear el servidor es un redespliegue. `.env.example` en el repositorio documenta cada variable sin valores.

Secretos de la aplicación:

- Contraseña de Postgres.
- Email y contraseña de la cuenta del seed.
- Secreto de sesión.
- Clave de idealista (más adelante).

Secretos de despliegue:

- Clave de autenticación efímera de Tailscale.
- Clave SSH de despliegue.
- Host del servidor.

## Alojamiento de la documentación

El portal de documentación es público y se aloja en Cloudflare Pages, servido en la raíz de `<proyecto>.pages.dev`. Cada merge a `main` lo publica y cada pull request obtiene una previsualización. Véase [D36](/es/adr/d36-docs-hosting-cloudflare-pages/).

## Producción

Pendiente. El alojamiento, el despliegue, los secretos (un GitHub Environment `production` separado con revisores obligatorios) y las copias de seguridad de producción se diseñan cuando se publique el producto. Las releases versionadas con release-please ([D33](/es/adr/d33-versioning-and-releases/)) se reservan para producción.
