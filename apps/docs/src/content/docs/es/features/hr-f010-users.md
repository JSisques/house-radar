---
title: "HR-F010: Usuarios y configuración"
description: "Cuentas de usuario y configuración. Simplificable para la primera release."
sidebar:
  order: 10
---

- **Prioridad:** P1
- **Sección de origen:** 10
- **Módulo responsable:** Por definir

Cuentas de usuario y configuración. Simplificable para la primera release.

## Requisitos

- [ ] Registro e inicio de sesión.
- [ ] Gestión de perfil.
- [ ] Configuración básica de preferencias.
- [ ] Gestión de favoritos.
- [ ] Gestión de búsquedas guardadas.
- [ ] Zona horaria y preferencias de visualización.
- [ ] Configuración de fuentes de datos.
- [ ] Panel básico de estado de los procesos de recopilación.

## Notas

- Para una primera instalación estrictamente personal se puede empezar con un único usuario y posponer el registro público.
- Decisión [D13](/es/adr/d13-users-and-authentication/): autenticación propia en NestJS (bounded context `identity`), registro deshabilitado y una única cuenta creada mediante seed; contraseñas con hash argon2.
- Criterios de aceptación y dependencias: por definir en la especificación funcional detallada.
