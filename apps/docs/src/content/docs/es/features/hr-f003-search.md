---
title: "HR-F003: Buscador y filtros avanzados"
description: "El buscador es uno de los módulos centrales del producto."
sidebar:
  order: 3
---

- **Prioridad:** P0
- **Sección de origen:** 3
- **Módulo responsable:** Por definir

El buscador es uno de los módulos centrales del producto.

## Requisitos

### Filtros económicos

- [ ] Precio mínimo.
- [ ] Precio máximo.
- [ ] Precio por metro cuadrado mínimo y máximo.

### Filtros de superficie

- [ ] Superficie construida mínima y máxima.
- [ ] Superficie útil mínima y máxima.
- [ ] Superficie de terreno mínima y máxima.

### Filtros de características

- [ ] Tipo de propiedad.
- [ ] Número de habitaciones.
- [ ] Número de baños.
- [ ] Estado de conservación.
- [ ] Propiedades para reformar.
- [ ] Casas independientes.
- [ ] Casas con terreno.
- [ ] Propiedades con garaje.
- [ ] Propiedades con jardín.

### Filtros geográficos

- [ ] Comunidad autónoma.
- [ ] Provincia.
- [ ] Municipio.
- [ ] Código postal.
- [ ] Radio respecto a una ubicación.
- [ ] Selección de zona en mapa.

### Ordenación

- [ ] Precio ascendente.
- [ ] Precio descendente.
- [ ] Precio por metro cuadrado.
- [ ] Superficie.
- [ ] Superficie de terreno.
- [ ] Fecha de incorporación.
- [ ] Fecha de actualización.

### Comportamiento del buscador

- [ ] Combinar varios filtros simultáneamente.
- [ ] Limpiar todos los filtros.
- [ ] Mostrar el número de resultados.
- [ ] Mantener los filtros al navegar entre resultados y fichas, cuando sea posible.
- [ ] Paginación o carga progresiva de resultados.

## Notas

- Los filtros de radio y de zona en mapa son consultas espaciales; se prueban contra un PostGIS real ([D6](/es/adr/d06-persistence/), [D14](/es/adr/d14-testing/)).
- Criterios de aceptación y dependencias: por definir en la especificación funcional detallada.
