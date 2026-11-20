---
title: "HR-F008: Histórico y seguimiento de precios"
description: "El histórico es uno de los elementos que puede diferenciar House Radar de un buscador inmobiliario tradicional."
sidebar:
  order: 8
---

- **Prioridad:** P0
- **Sección de origen:** 8
- **Módulo responsable:** Por definir

El histórico es uno de los elementos que puede diferenciar House Radar de un buscador inmobiliario tradicional.

## Requisitos

- [ ] Guardar snapshots de los anuncios.
- [ ] Registrar cambios de precio.
- [ ] Registrar cambios relevantes de características.
- [ ] Detectar anuncios desaparecidos.
- [ ] Consultar el precio inicial conocido.
- [ ] Consultar el precio actual.
- [ ] Calcular variación absoluta.
- [ ] Calcular variación porcentual.
- [ ] Mostrar evolución mediante una gráfica.

## Notas

- El histórico debe reflejar lo que House Radar ha observado desde que comenzó a recopilar un anuncio. No debe presentarse como un historial completo anterior a la primera observación.
- Almacenar snapshots e histórico propio depende de las condiciones de cada fuente ([D3](/es/adr/d03-source-strategy/)).
- Criterios de aceptación y dependencias: por definir en la especificación funcional detallada.
