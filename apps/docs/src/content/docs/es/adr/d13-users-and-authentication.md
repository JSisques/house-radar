---
title: "D13. Usuarios y autenticación"
description: "Autenticación propia en NestJS (bounded context `identity`), registro deshabilitado y una única cuenta creada mediante seed."
sidebar:
  order: 14
---

- **Estado:** Aceptada
- **Fecha:** 2026-11-20

## Contexto

La primera instalación es estrictamente personal, pero los favoritos y las búsquedas guardadas pertenecen a usuarios.

## Decisión

Autenticación propia en NestJS (bounded context `identity`), registro deshabilitado y una única cuenta creada mediante seed.

## Consecuencias

- Contraseñas con hash argon2.
- El modelo de usuarios soporta varios usuarios desde el inicio, aunque el registro público esté deshabilitado.
- Favoritos y búsquedas guardadas se asocian a un usuario, no son globales.
- El mecanismo de autenticación se expone mediante un puerto ([D10](/es/adr/d10-cross-cutting-architecture/)): migrar a OIDC (Keycloak, Authentik) o a un SaaS implica un nuevo adaptador.
