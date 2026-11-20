# House Radar --- Especificación funcional del MVP

**Producto:** House Radar\
**Concepto:** plataforma de descubrimiento y análisis inmobiliario que
centraliza anuncios de diferentes fuentes, normaliza sus datos y permite
buscar, comparar y seguir propiedades desde una única aplicación.

**Ámbito inicial recomendado:** Galicia, empezando por el área de
Santiago de Compostela.\
**Objetivo del MVP:** disponer de una base de datos inmobiliaria propia,
alimentada mediante fuentes autorizadas, con un buscador avanzado,
fichas de propiedades, mapa, favoritos e histórico de precios.

------------------------------------------------------------------------

## 0. Registro de decisiones

Decisiones de producto y técnicas tomadas antes de empezar el
desarrollo. Cada decisión se documentará como ADR en el portal de
documentación.

  ID   Decisión                       Resultado                                                                                  Fecha
  ---- ------------------------------ ------------------------------------------------------------------------------------------ ------------
  D0   Propósito del proyecto         Herramienta personal construida con estándares de producto real; sirve como portfolio y   2026-11-20
                                      puede evolucionar a producto público.
  D1   Lenguaje                       TypeScript de punta a punta (API, web, ingestion). Python para ingestion queda como        2026-11-20
                                      opción en V2 si se justifica.
  D2   Estrategia de repositorios     Monorepo único `house-radar` (pnpm workspaces + Turborepo) que incluye código,             2026-11-20
                                      infraestructura y documentación.
  D3   Estrategia de fuentes          Primera fuente objetivo: idealista Search API (oficial, acceso bajo solicitud).            2026-11-20
                                      Fuente provisional del MVP: importación manual por URL. Segunda fuente candidata:
                                      feeds autorizados de inmobiliarias locales de Santiago.
  D4   Framework backend              NestJS con DDD para `apps/api` y `apps/ingestion`. Las convenciones de código se          2026-11-20
                                      definirán más adelante en el repositorio.
  D5   Framework frontend             React + Vite (SPA) para `apps/web`. SSR de fichas pospuesto hasta una posible            2026-11-20
                                      publicación.
  D6   Persistencia                   PostgreSQL + PostGIS con MikroORM (Data Mapper + Unit of Work).                           2026-11-20
  D7   Colas y planificación          BullMQ + Redis (`@nestjs/bullmq`) para la ejecución de la ingestion.                       2026-11-20
  D8   Despliegue                     Servidor propio con Docker Compose. Despliegue agnóstico de la plataforma: el mismo        2026-11-20
                                      Compose debe poder moverse a un VPS sin cambios.
  D9   Mapa                           MapLibre GL (`react-map-gl`) detrás de un adaptador, sustituible sin afectar al resto.     2026-11-20
  D10  Arquitectura transversal       DDD con puertos y adaptadores tanto en backend como en frontend. Toda librería externa     2026-11-20
                                      (ORM, colas, mapa, gráficas, HTTP) se accede mediante un adaptador.
  D11  Portal de documentación        Astro + Starlight en `apps/docs`, bilingüe (español e inglés) con i18n. El inglés es la    2026-11-20
                                      fuente de verdad (locale por defecto); el español es una traducción.
  D12  Internacionalización web       `apps/web` preparado para i18n desde el inicio; la primera release solo incluye            2026-11-20
                                      español. Gallego, catalán y otros idiomas se añadirán como traducciones.
  D13  Usuarios y autenticación       Autenticación propia en NestJS (bounded context `identity`), registro deshabilitado y      2026-11-20
                                      una única cuenta creada mediante seed.
  D14  Testing                        TDD estricto (rojo, verde, refactor). Vitest (unitarios), Testing Library               2026-11-20
                                      (componentes), Testcontainers con Postgres + PostGIS y Redis reales (integración) y
                                      Playwright (E2E de flujos críticos).
  D15  Observabilidad                 Stack completo desde el MVP: OpenTelemetry (Collector) → Prometheus (métricas), Loki      2026-11-20
                                      (logs), Tempo (trazas) y Grafana (dashboards y alertas). Logs estructurados con Pino,
                                      health checks con `@nestjs/terminus` y Bull Board para jobs.
  D16  Calidad y flujo de trabajo     GitHub Actions (lint, typecheck, test y build de lo afectado con Turborepo), límites       2026-11-20
                                      arquitectónicos verificados en CI, Conventional Commits con commitlint, ramas de
                                      feature cortas con PR a `main`, versiones de Node y pnpm fijadas en el repositorio.

### Consecuencias de D0

-   Calidad de producto desde el inicio: ADRs, tests, CI y
    observabilidad.
-   El alcance del MVP se mantiene acotado: un usuario, Galicia, una
    fuente.

### Consecuencias de D1 y D2

-   El modelo de dominio normalizado se comparte como paquete interno
    (`packages/domain`), tipado de punta a punta.
-   Un cambio en el modelo se resuelve en un único PR atómico.
-   Los límites entre módulos los impone la arquitectura (paquetes y
    dependencias explícitas), no la separación en repositorios.
-   La ingestion es una aplicación independiente: podría reescribirse en
    otro lenguaje sin afectar al resto si se respeta su contrato.

### Consecuencias de D3

-   Se solicita la API key de la idealista Search API
    (<https://developers.idealista.com/access-request>). La aprobación
    no es automática y las condiciones de uso (cuotas, almacenamiento,
    redistribución) se conocerán al recibirla.
-   Hasta entonces, la importación manual por URL desbloquea el
    desarrollo de normalización, buscador, fichas e histórico.
-   El conector de idealista se diseña contra el contrato de la API
    oficial y se implementa al obtener acceso y validar que sus
    condiciones permiten almacenar snapshots e histórico propio.
-   Fotocasa, Habitaclia y pisos.com no ofrecen API pública conocida;
    se descarta el scraping no autorizado (principio de producto 7).

### Consecuencias de D4

-   Organización por bounded contexts (por ejemplo: listings,
    properties, pricing-history, ingestion, users).
-   Capas de dominio, aplicación e infraestructura por contexto.
-   El dominio no depende de NestJS: decoradores, módulos e inyección
    de dependencias se limitan a las capas de aplicación e
    infraestructura.
-   Convenciones de código pendientes de definir en el monorepo.

### Consecuencias de D5

-   La web se despliega como estáticos y consume directamente la API
    NestJS.
-   Componentes organizados con atomic design y patrón
    container-presentational.
-   Si el producto se publica y el SEO de las fichas pasa a ser
    relevante, se evaluará SSR para esas páginas.

### Consecuencias de D6

-   El mapeo se define con `EntitySchema` (sin decoradores), de modo que
    las entidades de dominio no dependen de MikroORM.
-   MikroORM no ofrece soporte nativo completo de PostGIS: los tipos
    geométricos se implementan como custom types (por ejemplo, `Point`)
    y las consultas espaciales (radio, zona en mapa) se escriben con
    QueryBuilder o SQL explícito encapsulado en los repositorios.
-   Migraciones versionadas en el repositorio mediante el sistema de
    migraciones de MikroORM.

### Consecuencias de D7

-   Ejecución periódica mediante jobs repetibles.
-   Reintentos automáticos con backoff ante errores temporales.
-   Estado de trabajos pendientes, fallidos y completados consultable
    mediante Bull Board, que cubre parte de la sección 12.
-   Redis se añade como servicio en Docker Compose.

### Consecuencias de D9 y D10

-   El frontend define un puerto de mapa (marcadores, clustering,
    selección de zona, eventos de movimiento) y MapLibre es su primera
    implementación.
-   Los componentes de UI dependen del puerto, no de MapLibre ni de
    `react-map-gl`.
-   Cambiar de proveedor de mapas (Leaflet, Google Maps, Mapbox) implica
    escribir un nuevo adaptador, sin modificar dominio ni componentes.
-   El mismo criterio aplica al resto de dependencias externas en ambos
    lados.

### Consecuencias de D11

-   Starlight aporta navegación, búsqueda (Pagefind), i18n, modo oscuro
    y MDX.
Estructura de contenidos:

    apps/docs/src/content/docs/
    ├── product/        # Visión, principios, alcance del MVP, fuera de alcance
    ├── features/       # HR-F001… una página por funcionalidad con criterios de aceptación
    ├── architecture/   # Visión general, bounded contexts, monorepo, diagramas C4
    ├── adr/            # Plantilla y un ADR por decisión de este registro
    ├── domain/         # Lenguaje ubicuo, modelo de datos (propiedad vs anuncio)
    ├── sources/        # Estrategia de fuentes, idealista, importación manual
    └── operations/     # Despliegue, runbooks de ingestion, observabilidad

### Consecuencias de D12

-   Ningún texto de interfaz se escribe directamente en los
    componentes: todo pasa por claves de traducción.
-   Formato de fechas, números, precios y superficies dependiente del
    locale.
-   La librería de i18n se accede mediante un adaptador (D10).
-   La funcionalidad "Multiidioma" de la sección 13 pasa a significar
    únicamente añadir traducciones; la infraestructura ya existe.

### Consecuencias de D13

-   Contraseñas con hash argon2.
-   El modelo de usuarios soporta varios usuarios desde el inicio,
    aunque el registro público esté deshabilitado.
-   Favoritos y búsquedas guardadas se asocian a un usuario, no son
    globales.
-   El mecanismo de autenticación se expone mediante un puerto (D10):
    migrar a OIDC (Keycloak, Authentik) o a un SaaS implica un nuevo
    adaptador.

### Consecuencias de D14

-   Ningún código de producción se escribe sin un test que falle
    previamente.
-   Las consultas espaciales y los custom types de MikroORM se prueban
    contra PostGIS real, nunca contra mocks o SQLite.
-   Los E2E se limitan a los criterios de aceptación de la sección 15.
-   Vitest en NestJS requiere compilación con SWC (decoradores y
    metadatos).

### Consecuencias de D15

-   La instrumentación se hace con OpenTelemetry detrás de un adaptador
    (D10); los backends de observabilidad son intercambiables.
-   Docker Compose incluye OTel Collector, Prometheus, Loki, Tempo y
    Grafana.
-   Alertas en Grafana como mínimo para: ingestion sin ejecuciones
    exitosas en un periodo configurable, tasa de errores de extracción y
    health checks caídos.
-   La sección 12 (Administración y observabilidad) pasa a P1 en lo
    relativo a logs, métricas, health checks y alertas.

### Estructura prevista del monorepo

    house-radar/
    ├── apps/
    │   ├── api/          # API backend
    │   ├── web/          # Frontend: buscador, fichas, mapa, dashboard
    │   ├── ingestion/    # Workers de recopilación y conectores
    │   └── docs/         # Portal de documentación (Astro)
    ├── packages/
    │   └── domain/       # Modelo normalizado compartido
    └── infra/            # Docker Compose y configuración de despliegue

> **Nota:** el repositorio provisional `house-radar-docs` se descartó.
> La documentación vive en `apps/docs` dentro del monorepo `house-radar`.

------------------------------------------------------------------------

## 1. Recopilación de anuncios (Ingestion)

**Prioridad: P0 --- Core**

El sistema debe incorporar propiedades desde diferentes fuentes,
mediante conectores independientes.

-   [ ] Arquitectura de conectores independientes por fuente.
-   [ ] Integración con la primera fuente de anuncios autorizada.
-   [ ] Preparación de conectores para futuras fuentes.
-   [ ] Ejecución periódica de procesos de recopilación.
-   [ ] Descubrimiento de nuevos anuncios.
-   [ ] Extracción de información de los anuncios.
-   [ ] Extracción de imágenes cuando su uso esté permitido.
-   [ ] Identificación única de cada anuncio en su fuente.
-   [ ] Registro de errores de extracción.
-   [ ] Reintentos automáticos ante errores temporales.
-   [ ] Control de anuncios ya procesados.
-   [ ] Importación manual mediante URL.
-   [ ] Registro de fecha de última actualización.

> **Consideración legal y operativa:** antes de implementar un conector
> hay que revisar las condiciones de uso de la fuente, sus APIs, feeds y
> permisos. No se debe asumir que la extracción automatizada está
> permitida. Cuando no exista autorización, se pueden utilizar
> importaciones manuales, enlaces u otras fuentes permitidas.

## 2. Gestión y normalización de propiedades

**Prioridad: P0 --- Core**

Todos los anuncios deben convertirse a un modelo común,
independientemente de su procedencia.

### 2.1 Información general

-   [ ] Título del anuncio.
-   [ ] Descripción.
-   [ ] Precio.
-   [ ] Superficie construida.
-   [ ] Superficie útil.
-   [ ] Superficie de terreno.
-   [ ] Número de habitaciones.
-   [ ] Número de baños.
-   [ ] Tipo de propiedad.
-   [ ] Estado de conservación.
-   [ ] Año de construcción, cuando esté disponible.

### 2.2 Características adicionales

-   [ ] Garaje.
-   [ ] Jardín.
-   [ ] Piscina.
-   [ ] Terraza.
-   [ ] Balcón.
-   [ ] Calefacción.
-   [ ] Ascensor.
-   [ ] Certificado energético.
-   [ ] Tipo de suelo.
-   [ ] Agua.
-   [ ] Electricidad.
-   [ ] Saneamiento.

### 2.3 Procedencia y estado del anuncio

-   [ ] Portal de origen.
-   [ ] URL original.
-   [ ] Identificador externo.
-   [ ] Fecha de publicación, si se conoce.
-   [ ] Fecha de incorporación a House Radar.
-   [ ] Fecha de última comprobación.
-   [ ] Estado del anuncio: activo, desaparecido o desconocido.

Los campos deben admitir valores desconocidos. La ausencia de un dato en
el anuncio no significa que la propiedad carezca de esa característica.
Conviene distinguir entre datos declarados por el anunciante, datos
calculados y datos inferidos.

## 3. Buscador y filtros avanzados

**Prioridad: P0 --- Core**

El buscador es uno de los módulos centrales del producto.

### 3.1 Filtros económicos

-   [ ] Precio mínimo.
-   [ ] Precio máximo.
-   [ ] Precio por metro cuadrado mínimo y máximo.

### 3.2 Filtros de superficie

-   [ ] Superficie construida mínima y máxima.
-   [ ] Superficie útil mínima y máxima.
-   [ ] Superficie de terreno mínima y máxima.

### 3.3 Filtros de características

-   [ ] Tipo de propiedad.
-   [ ] Número de habitaciones.
-   [ ] Número de baños.
-   [ ] Estado de conservación.
-   [ ] Propiedades para reformar.
-   [ ] Casas independientes.
-   [ ] Casas con terreno.
-   [ ] Propiedades con garaje.
-   [ ] Propiedades con jardín.

### 3.4 Filtros geográficos

-   [ ] Comunidad autónoma.
-   [ ] Provincia.
-   [ ] Municipio.
-   [ ] Código postal.
-   [ ] Radio respecto a una ubicación.
-   [ ] Selección de zona en mapa.

### 3.5 Ordenación

-   [ ] Precio ascendente.
-   [ ] Precio descendente.
-   [ ] Precio por metro cuadrado.
-   [ ] Superficie.
-   [ ] Superficie de terreno.
-   [ ] Fecha de incorporación.
-   [ ] Fecha de actualización.

### 3.6 Comportamiento del buscador

-   [ ] Combinar varios filtros simultáneamente.
-   [ ] Limpiar todos los filtros.
-   [ ] Mostrar el número de resultados.
-   [ ] Mantener los filtros al navegar entre resultados y fichas,
    cuando sea posible.
-   [ ] Paginación o carga progresiva de resultados.

## 4. Fichas de propiedades

**Prioridad: P0 --- Core**

Cada propiedad tendrá una página de detalle propia.

-   [ ] Galería de fotografías disponibles y cuyo uso esté permitido.
-   [ ] Título y descripción.
-   [ ] Precio actual.
-   [ ] Características principales.
-   [ ] Ubicación.
-   [ ] Superficie construida y superficie de terreno.
-   [ ] Precio por metro cuadrado, cuando pueda calcularse.
-   [ ] Características adicionales.
-   [ ] Fuente original.
-   [ ] Enlace para visitar el anuncio original.
-   [ ] Fecha de incorporación.
-   [ ] Última actualización.
-   [ ] Histórico de precios disponible.
-   [ ] Posibles anuncios duplicados relacionados.

## 5. Detección de duplicados

**Prioridad: P0 --- Core**

Una misma vivienda puede aparecer anunciada en varios portales. House
Radar debe diferenciar entre el inmueble real y los anuncios publicados
sobre él.

-   [ ] Detección por identificador externo.
-   [ ] Detección por coincidencia de dirección o ubicación.
-   [ ] Comparación de superficie.
-   [ ] Comparación de precio.
-   [ ] Comparación de habitaciones.
-   [ ] Detección de posibles duplicados.
-   [ ] Vinculación de varios anuncios a una misma propiedad.
-   [ ] Posibilidad de resolver manualmente coincidencias dudosas.

**Criterio recomendado:** en la primera versión, el sistema debe señalar
coincidencias probables y permitir revisión manual. Es preferible no
fusionar automáticamente dos viviendas distintas.

## 6. Mapa inmobiliario

**Prioridad: P1 --- Experiencia de usuario**

-   [ ] Visualización de propiedades en un mapa.
-   [ ] Marcadores con precios.
-   [ ] Apertura de ficha desde el marcador.
-   [ ] Sincronización entre mapa y resultados.
-   [ ] Filtro por zona geográfica.
-   [ ] Geolocalización de propiedades.
-   [ ] Agrupación de marcadores cuando hay muchas propiedades.
-   [ ] Visualización aproximada cuando no se dispone de coordenadas
    exactas.

## 7. Favoritos y búsquedas guardadas

**Prioridad: P1 --- Experiencia de usuario**

-   [ ] Marcar propiedades como favoritas.
-   [ ] Consultar listado de favoritos.
-   [ ] Eliminar favoritos.
-   [ ] Guardar búsquedas con sus filtros.
-   [ ] Editar búsquedas guardadas.
-   [ ] Eliminar búsquedas guardadas.
-   [ ] Consultar resultados de cada búsqueda.

## 8. Histórico y seguimiento de precios

**Prioridad: P0 --- Core**

El histórico es uno de los elementos que puede diferenciar House Radar
de un buscador inmobiliario tradicional.

-   [ ] Guardar snapshots de los anuncios.
-   [ ] Registrar cambios de precio.
-   [ ] Registrar cambios relevantes de características.
-   [ ] Detectar anuncios desaparecidos.
-   [ ] Consultar el precio inicial conocido.
-   [ ] Consultar el precio actual.
-   [ ] Calcular variación absoluta.
-   [ ] Calcular variación porcentual.
-   [ ] Mostrar evolución mediante una gráfica.

El histórico debe reflejar lo que House Radar ha observado desde que
comenzó a recopilar un anuncio. No debe presentarse como un historial
completo anterior a la primera observación.

## 9. Dashboard y estadísticas

**Prioridad: P1 --- Experiencia de usuario**

-   [ ] Número total de propiedades recopiladas.
-   [ ] Número de anuncios activos.
-   [ ] Número de anuncios nuevos.
-   [ ] Precio medio de las propiedades.
-   [ ] Precio mediano.
-   [ ] Precio medio por metro cuadrado.
-   [ ] Superficie media de las viviendas.
-   [ ] Distribución por tipo de propiedad.
-   [ ] Distribución geográfica.
-   [ ] Evolución de precios de los anuncios recopilados.
-   [ ] Estadísticas por municipio.

Las estadísticas deben indicar el tamaño y la procedencia de la muestra.
Los precios anunciados no equivalen necesariamente a los precios reales
de compraventa.

## 10. Usuarios y configuración

**Prioridad: P1 --- Simplificable para la primera release**

-   [ ] Registro e inicio de sesión.
-   [ ] Gestión de perfil.
-   [ ] Configuración básica de preferencias.
-   [ ] Gestión de favoritos.
-   [ ] Gestión de búsquedas guardadas.
-   [ ] Zona horaria y preferencias de visualización.
-   [ ] Configuración de fuentes de datos.
-   [ ] Panel básico de estado de los procesos de recopilación.

Para una primera instalación estrictamente personal se puede empezar con
un único usuario y posponer el registro público.

## 11. Notificaciones y alertas

**Prioridad: P2 --- Posterior a la primera release**

-   [ ] Notificar nuevos anuncios.
-   [ ] Notificar bajadas de precio.
-   [ ] Notificar cambios importantes en anuncios.
-   [ ] Configurar alertas por búsqueda guardada.
-   [ ] Configurar frecuencia de notificaciones.
-   [ ] Notificaciones dentro de la aplicación.
-   [ ] Preparar envío de notificaciones por email.

## 12. Administración y observabilidad

**Prioridad: P1/P2 --- Operación del sistema**

House Radar depende de procesos automáticos que pueden fallar. Es
necesario poder comprobar su estado y diagnosticar problemas.

-   [ ] Consultar estado de los conectores.
-   [ ] Consultar últimas ejecuciones.
-   [ ] Consultar anuncios procesados.
-   [ ] Consultar errores de extracción.
-   [ ] Consultar trabajos pendientes.
-   [ ] Reintentar procesos fallidos.
-   [ ] Activar y desactivar fuentes.
-   [ ] Consultar estadísticas de ingesta.
-   [ ] Logs estructurados.
-   [ ] Métricas de rendimiento.
-   [ ] Health checks de los servicios.

------------------------------------------------------------------------

# 13. Funcionalidades fuera del MVP

Estas funcionalidades se reservan para versiones posteriores para evitar
que el alcance inicial crezca demasiado.

  Funcionalidad                                   Versión propuesta
  ----------------------------------------------- -------------------
  Búsqueda mediante IA                            V2
  Análisis de fotografías con visión artificial   V2
  Estimación automática del valor de mercado      V2
  Calculadora avanzada de reformas                V2
  Comparador inteligente con IA                   V2
  Predicción de bajadas de precio                 V3
  Análisis de rentabilidad de inversiones         V2
  Recomendaciones personalizadas                  V2
  Integración con Catastro                        V2
  Análisis urbanístico de parcelas                V3
  Aplicación móvil                                V3
  Multiidioma                                     V2
  Suscripciones y planes comerciales              V3
  Multi-tenant para inmobiliarias                 V3

# 14. Priorización del MVP

## P0 --- Core

Funcionalidades necesarias para que House Radar cumpla su propósito
principal.

-   [ ] Ingesta de anuncios.
-   [ ] Normalización.
-   [ ] Persistencia.
-   [ ] Buscador y filtros.
-   [ ] Fichas de propiedades.
-   [ ] Enlace a fuente original.
-   [ ] Detección básica de duplicados.
-   [ ] Histórico de precios.

## P1 --- Experiencia de usuario

Funcionalidades que hacen que la plataforma sea cómoda y útil en el día
a día.

-   [ ] Mapa interactivo.
-   [ ] Favoritos.
-   [ ] Búsquedas guardadas.
-   [ ] Dashboard.
-   [ ] Estadísticas por municipio.
-   [ ] Gestión básica de usuarios.

## P2 --- Automatización

Funcionalidades que mejoran la operación y la recurrencia de uso.

-   [ ] Alertas.
-   [ ] Notificaciones.
-   [ ] Administración avanzada.
-   [ ] Monitorización de conectores.
-   [ ] Reintentos y recuperación avanzada.

------------------------------------------------------------------------

# 15. Criterios de aceptación de la primera release

House Radar estará listo para su primera release cuando cumpla estos
escenarios:

1.  Se pueden incorporar anuncios desde al menos una fuente autorizada.
2.  Los anuncios se almacenan con un modelo de datos común.
3.  Los anuncios se actualizan periódicamente.
4.  Se pueden identificar posibles duplicados.
5.  Se pueden buscar propiedades combinando múltiples filtros.
6.  Se pueden consultar propiedades en un mapa.
7.  Se puede acceder a la ficha completa y al anuncio original.
8.  Se puede guardar una propiedad como favorita.
9.  Se puede consultar el histórico de precios.
10. Se puede guardar una búsqueda y volver a ejecutarla.
11. Se puede comprobar que los procesos de ingesta funcionan
    correctamente.

------------------------------------------------------------------------

# 16. Alcance recomendado de la primera versión

  Área                Alcance
  ------------------- ------------------------------------
  Fuentes             Importación manual por URL + idealista API (D3)
  Geografía           Galicia
  Tipos de inmueble   Todos los soportados por la fuente
  Backend             API completa
  Frontend            Dashboard y buscador
  Ingestion           Workers independientes
  Base de datos       PostgreSQL + PostGIS
  Usuarios            Un usuario o autenticación básica
  IA                  Ninguna inicialmente
  Infraestructura     Docker Compose
  Lenguaje            TypeScript de punta a punta (D1)
  Repositorio         Monorepo `house-radar` (D2)

------------------------------------------------------------------------

# 17. Principios de producto

1.  **La base de datos propia es el activo principal.** Cada anuncio
    nuevo, cambio de precio y actualización debe aportar valor al
    histórico de House Radar.
2.  **Separar propiedad y anuncio.** Un inmueble puede tener varios
    anuncios en diferentes portales.
3.  **Conservar la procedencia.** Cada dato debe poder relacionarse con
    su fuente y fecha de observación.
4.  **No inventar información.** Los valores desconocidos deben seguir
    siendo desconocidos; no se deben inferir características sin
    indicarlo.
5.  **Diseñar para múltiples fuentes.** Los conectores deben ser
    independientes y producir datos normalizados.
6.  **Priorizar la utilidad antes que la IA.** Primero construir una
    buena base de datos y un buscador fiable.
7.  **Respetar las condiciones de las fuentes.** La ingesta debe basarse
    en APIs, feeds, permisos o métodos de recopilación autorizados.

## 18. Siguiente paso: convertir funcionalidades en trabajo ejecutable

El siguiente paso de producto y desarrollo será transformar este
documento en especificaciones funcionales detalladas.

Cada funcionalidad debería tener:

-   Identificador único, por ejemplo `HR-F001`.
-   Nombre y descripción.
-   Prioridad.
-   Criterios de aceptación.
-   Módulo responsable dentro del monorepo (`apps/api`, `apps/web`,
    `apps/ingestion`, `apps/docs`, `packages/domain` o `infra`).
-   Dependencias con otras funcionalidades.
-   Casos límite y reglas de negocio relevantes.

Esto permitirá convertir el documento en GitHub Issues, organizarlas
mediante milestones y mantener trazabilidad entre requisitos,
implementación y releases.
