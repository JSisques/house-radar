---
title: "HR-F012: Administración y observabilidad"
description: "House Radar depende de procesos automáticos que pueden fallar. Es necesario poder comprobar su estado y diagnosticar problemas."
sidebar:
  order: 12
---

- **Prioridad:** P1/P2
- **Sección de origen:** 12
- **Módulo responsable:** Por definir

House Radar depende de procesos automáticos que pueden fallar. Es necesario poder comprobar su estado y diagnosticar problemas.

## Requisitos

- [ ] Consultar estado de los conectores.
- [ ] Consultar últimas ejecuciones.
- [ ] Consultar anuncios procesados.
- [ ] Consultar errores de extracción.
- [ ] Consultar trabajos pendientes.
- [ ] Reintentar procesos fallidos.
- [ ] Activar y desactivar fuentes.
- [ ] Consultar estadísticas de ingesta.
- [ ] Logs estructurados.
- [ ] Métricas de rendimiento.
- [ ] Health checks de los servicios.

## Notas

- Según [D15](/es/adr/d15-observability/), esta área es P1 en lo relativo a logs, métricas, health checks y alertas. Bull Board cubre parte de ella ([D7](/es/adr/d07-queues-and-scheduling/)).
- Véase [Visión general de operaciones](/es/operations/overview/).
- Criterios de aceptación y dependencias: por definir en la especificación funcional detallada.
