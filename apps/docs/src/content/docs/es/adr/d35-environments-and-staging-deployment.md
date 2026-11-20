---
title: "D35. Entornos y despliegue en staging"
description: "Local, CI, un staging desechable accesible solo por Tailscale y una producción sin definir; imágenes en GHCR, despliegue automático al fusionar, secretos en GitHub Environments y health checks por servicio con rollback."
sidebar:
  order: 36
---

- **Estado:** Aceptada
- **Fecha:** 2026-11-20

## Contexto

El despliegue se hace en un servidor propio con Docker Compose ([D8](/es/adr/d08-deployment/)) y el producto se versiona como una unidad ([D33](/es/adr/d33-versioning-and-releases/)). Antes de empezar M4 es necesario definir qué entornos existen, cómo llega la aplicación a ellos, cómo se gestionan los secretos y cómo se verifica y se deshace un despliegue. La producción aún no está definida: el producto es una herramienta personal hasta que se publique ([D0](/es/adr/d00-project-purpose/)).

## Decisión

### Entornos

| Entorno | Dónde | Acceso | Desde |
| --- | --- | --- | --- |
| Local | Máquina del desarrollador, Docker Compose | localhost | M0 |
| CI | GitHub Actions + Testcontainers | Solo el pipeline | M0 |
| Staging | Servidor propio | Red privada (Tailscale) | M4 |
| Producción | Por definir (alojamiento público) | Internet, dominio y TLS | Cuando se publique el producto |

Staging se expone solo dentro de la red privada de Tailscale: el servidor no tiene puertos públicos.

### Staging es desechable

Los datos de staging se pueden borrar y regenerar; no es donde se acumula el histórico real de precios. Los datos reales empiezan con producción. En consecuencia, las migraciones destructivas son aceptables en staging y nunca en producción, y las copias de seguridad son un requisito de producción, no de staging.

### Imágenes y despliegue automático

- Las imágenes se construyen en GitHub Actions y se publican en GitHub Container Registry (GHCR), etiquetadas con el SHA del commit y, en las releases, con la versión del producto ([D33](/es/adr/d33-versioning-and-releases/)).
- Cada merge a `main` despliega automáticamente en staging. El workflow se une a la tailnet con la GitHub Action oficial de Tailscale mediante una clave de autenticación efímera y etiquetada, restringida por ACL al servidor de staging, se conecta por SSH con una clave de despliegue restringida y ejecuta `docker compose pull && docker compose up -d` con el nuevo SHA.
- Las releases versionadas se reservan para producción.

### Secretos

- Un GitHub Environment `staging` contiene los secretos de la aplicación (contraseña de Postgres, credenciales de la cuenta del seed, secreto de sesión y, más adelante, la clave de idealista) y los de despliegue (clave de autenticación efímera de Tailscale, clave SSH de despliegue, host del servidor).
- En cada despliegue el workflow escribe el `.env` del servidor (modo `600`) a partir de esos secretos y levanta el stack. GitHub es la única fuente de verdad: cambiar un secreto significa editarlo allí y volver a desplegar, y recrear el servidor es un redespliegue.
- Producción será un environment `production` separado, con sus propios secretos y revisores obligatorios.
- `.env.example` en el repositorio documenta cada variable sin valores.

### Flujo de despliegue, health checks y rollback

1. **Migraciones primero**, en un contenedor efímero con la nueva imagen. Si fallan, el despliegue se detiene y la versión anterior sigue en marcha.
2. **Health checks por servicio.** Cada servicio declara su propio healthcheck de Docker Compose y el despliegue ejecuta `docker compose up -d --wait`. Compose espera a que todos los servicios bloqueantes estén `healthy`; un timeout hace fallar el comando y dispara el rollback. Los mismos healthchecks funcionan en local.

| Servicio | Comprobación | Bloquea el despliegue |
| --- | --- | --- |
| `postgres` | `pg_isready` y extensión PostGIS disponible | Sí |
| `redis` | `PING` | Sí |
| `api` | `/health` (terminus): Postgres, Redis, migraciones al día | Sí |
| `ingestion` | `/health` propio: conexiones a Redis y al worker de BullMQ | Sí |
| Relay del outbox | `/health` propio: puede leer el outbox y publicar en BullMQ | Sí |
| `web` | Sirve `index.html` y expone la versión desplegada (`/version.json` con el SHA) | Sí |
| Observabilidad (Grafana, Prometheus, Loki, Tempo, OTel Collector) | Endpoints de readiness | No, solo aviso |

3. **Smoke test de extremo a extremo.** Una petición a través de la web hasta la API confirma que el SHA servido es el nuevo: las piezas están conectadas, no solo vivas.
4. **Rollback.** El servidor conserva el SHA de la última versión sana. Si la nueva falla, el workflow vuelve a desplegarla y termina en rojo, de modo que GitHub avisa de que el merge rompió staging.
5. **Concurrencia.** Un grupo `concurrency` de Actions por entorno hace que los merges consecutivos se desplieguen uno tras otro, sin solaparse.

La observabilidad no bloquea el despliegue: un Grafana lento no debe provocar el rollback de una aplicación sana. El workflow lo notifica como aviso y las alertas de [D15](/es/adr/d15-observability/) cubren el resto.

### Producción

El alojamiento, el despliegue, los secretos y las copias de seguridad de producción no se definen ahora. Se diseñarán cuando se publique el producto.

## Consecuencias

- La aplicación se ejecuta en un entorno real desde M4 sin exponer nada a internet.
- Cada merge que llega a staging da feedback rápido, y un despliegue fallido vuelve a la última versión sana.
- Staging se puede recrear en cualquier momento desde GitHub, por lo que el servidor no guarda estado único.
- Los health checks de cada servicio sirven como comprobaciones locales y como puerta del despliegue.
- Las copias de seguridad (#101) salen de M4 y pasan a formar parte del trabajo futuro de producción.
- Añade al repositorio un workflow de despliegue, endpoints de healthcheck por servicio y un `.env.example`.
- El acoplamiento entre merge y despliegue implica que un `main` roto rompe staging hasta que se corrija.

## Alternativas consideradas

- **Internet público con dominio, o Cloudflare Tunnel, para staging:** expone un servidor que no guarda datos reales y exige un dominio o un túnel de terceros ya. Descartada en favor de la red privada de Tailscale.
- **Staging con datos reales:** obliga a tener copias de seguridad, migraciones cuidadosas y operación de nivel producción antes de publicar el producto. Descartada.
- **Desplegar solo en releases o manualmente:** feedback más lento y un paso manual que se desvía de `main`. Descartada; las releases se reservan para producción.
- **`.env` solo en el servidor:** no está versionado ni documentado y se pierde con el servidor. Descartada.
- **SOPS + age:** herramienta adicional y gestión de claves, demasiada ceremonia para un staging desechable. Descartada.
- **Health checks solo de la API:** una API sana no dice nada del worker, el relay ni la web. Descartada en favor de comprobaciones por servicio.
