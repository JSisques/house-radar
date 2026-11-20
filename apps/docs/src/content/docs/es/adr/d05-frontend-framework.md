---
title: "D5. Framework frontend"
description: "React + Vite (SPA) para `apps/web`. SSR de fichas pospuesto hasta una posible publicación."
sidebar:
  order: 6
---

- **Estado:** Aceptada
- **Fecha:** 2026-11-20

## Contexto

La aplicación web `apps/web` necesita un enfoque de renderizado y un framework.

## Decisión

React + Vite (SPA) para `apps/web`. SSR de fichas pospuesto hasta una posible publicación.

## Consecuencias

- La web se despliega como estáticos y consume directamente la API NestJS.
- Componentes organizados con atomic design y patrón container-presentational.
- Si el producto se publica y el SEO de las fichas pasa a ser relevante, se evaluará SSR para esas páginas.

## Alternativas consideradas

- SSR de fichas: pospuesto hasta una posible publicación.
