---
title: "HR-F001: Recopilación de anuncios (ingestion)"
description: "El sistema debe incorporar propiedades desde diferentes fuentes, mediante conectores independientes."
sidebar:
  order: 1
---

- **Prioridad:** P0
- **Sección de origen:** 1
- **Módulo responsable:** Por definir

El sistema debe incorporar propiedades desde diferentes fuentes, mediante conectores independientes.

## Requisitos

- [ ] Arquitectura de conectores independientes por fuente.
- [ ] Integración con la primera fuente de anuncios autorizada.
- [ ] Preparación de conectores para futuras fuentes.
- [ ] Ejecución periódica de procesos de recopilación.
- [ ] Descubrimiento de nuevos anuncios.
- [ ] Extracción de información de los anuncios.
- [ ] Extracción de imágenes cuando su uso esté permitido.
- [ ] Identificación única de cada anuncio en su fuente.
- [ ] Registro de errores de extracción.
- [ ] Reintentos automáticos ante errores temporales.
- [ ] Control de anuncios ya procesados.
- [ ] Importación manual mediante URL.
- [ ] Registro de fecha de última actualización.

## Notas

- **Consideración legal y operativa:** antes de implementar un conector hay que revisar las condiciones de uso de la fuente, sus APIs, feeds y permisos. No se debe asumir que la extracción automatizada está permitida. Cuando no exista autorización, se pueden utilizar importaciones manuales, enlaces u otras fuentes permitidas.
- Decisiones relacionadas: [D3](/es/adr/d03-source-strategy/) (fuentes) y [D7](/es/adr/d07-queues-and-scheduling/) (BullMQ + Redis para la ejecución, jobs repetibles y reintentos con backoff).
- Criterios de aceptación y dependencias: por definir en la especificación funcional detallada.
