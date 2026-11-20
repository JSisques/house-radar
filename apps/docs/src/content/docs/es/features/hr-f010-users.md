---
title: "HR-F010: Usuarios y configuración"
description: "Cuentas de usuario y configuración. Simplificable para la primera versión."
sidebar:
  order: 10
---

## Resumen

Cuentas de usuario y configuración, simplificadas para la primera versión: la autenticación está integrada en el backend, el registro público está deshabilitado y se crea una única cuenta mediante un seed ([D13](/es/adr/d13-users-and-authentication/)). El modelo admite varios usuarios desde el inicio y todo lo que posee un usuario, como favoritos y búsquedas guardadas, está asociado a ese usuario.

## Prioridad

P1 (sección de origen 10).

## Módulos responsables

- `apps/api`, contexto delimitado `identity`: autenticación, hash de contraseñas con argon2, seed de la cuenta y el puerto de autenticación ([D10](/es/adr/d10-cross-cutting-architecture/)).
- `apps/api`, contexto delimitado `users`: perfil y preferencias.
- `apps/web`: pantallas de inicio de sesión, perfil y configuración.
- `infra`: ejecución del seed de la cuenta en el despliegue.

## Dependencias

- [HR-F007](/es/features/hr-f007-favorites-saved-searches/): los favoritos y las búsquedas guardadas pertenecen al usuario autenticado.
- [HR-F012](/es/features/hr-f012-admin-observability/): la configuración de fuentes de datos y el panel de estado de la recopilación están en el área de administración.
- [HR-F011](/es/features/hr-f011-notifications/): preferencias de notificación (posterior al MVP).
- ADR: [D4](/es/adr/d04-backend-framework/), [D10](/es/adr/d10-cross-cutting-architecture/), [D12](/es/adr/d12-web-internationalization/), [D13](/es/adr/d13-users-and-authentication/).

## Historias de usuario

- Como propietario de la instalación, quiero iniciar sesión con mi cuenta, para que solo yo pueda usar mi House Radar.
- Como usuario, quiero establecer mi zona horaria, para que las fechas aparezcan como espero.
- Como usuario, quiero gestionar mi perfil y mi contraseña, para que mi cuenta siga bajo mi control.

## Reglas de negocio

- **HR-F010-BR1:** la autenticación se implementa en NestJS en el contexto delimitado `identity` y se expone mediante un puerto; un proveedor distinto (OIDC o un SaaS) sería un nuevo adaptador ([D13](/es/adr/d13-users-and-authentication/), [D10](/es/adr/d10-cross-cutting-architecture/)).
- **HR-F010-BR2:** el registro público está deshabilitado. La única forma de crear una cuenta en la primera versión es el seed.
- **HR-F010-BR3:** las contraseñas se almacenan con hash argon2 y nunca se almacenan ni registran en texto plano.
- **HR-F010-BR4:** el modelo de usuario admite varios usuarios desde el inicio, aunque el registro esté deshabilitado.
- **HR-F010-BR5:** toda operación de la API distinta del inicio de sesión y los health checks requiere un usuario autenticado.
- **HR-F010-BR6:** los favoritos y las búsquedas guardadas están asociados a un usuario y no son globales; un usuario nunca accede a datos de otro usuario ([HR-F007](/es/features/hr-f007-favorites-saved-searches/)).
- **HR-F010-BR7:** los intentos de inicio de sesión fallidos devuelven el mismo error genérico exista o no la cuenta.
- **HR-F010-BR8:** el usuario gestiona un perfil y puede cambiar su contraseña indicando la actual.
- **HR-F010-BR9:** el usuario puede establecer una zona horaria; es la única preferencia en el MVP. Las preferencias pertenecen al usuario y se aplican cuando la interfaz muestra fechas y valores.
- **HR-F010-BR10:** la interfaz está solo en español en la primera versión, pero preparada para más idiomas ([D12](/es/adr/d12-web-internationalization/)); no se expone una preferencia de idioma hasta que exista otra traducción.
- **HR-F010-BR11:** la configuración de fuentes de datos y el panel de estado de los procesos de recopilación forman parte de la administración ([HR-F012](/es/features/hr-f012-admin-observability/)) y son accesibles desde el área de configuración.
- **HR-F010-BR12:** la cuenta seed se crea mediante un comando de CLI que lee las credenciales de variables de entorno y falla si la cuenta ya existe.
- **HR-F010-BR13:** la sesión es una cookie httpOnly respaldada por una sesión en el servidor almacenada en Redis, con una expiración deslizante de 7 días.
- **HR-F010-BR14:** la contraseña debe tener al menos 12 caracteres. Tras 5 inicios de sesión fallidos la cuenta se bloquea durante 15 minutos.
- **HR-F010-BR15:** la única preferencia en el MVP es la zona horaria.

## Criterios de aceptación

- **HR-F010-AC1:** Dado que el seed se ha ejecutado, Cuando se inicia la instalación, Entonces existe exactamente una cuenta y puede iniciar sesión.
- **HR-F010-AC2:** Dadas credenciales válidas, Cuando el usuario inicia sesión, Entonces obtiene una sesión autenticada y accede a la aplicación.
- **HR-F010-AC3:** Dadas credenciales erróneas, Cuando el usuario intenta iniciar sesión, Entonces se deniega el acceso con un error genérico que no revela si la cuenta existe.
- **HR-F010-AC4:** Dada una petición para crear una cuenta a través de la interfaz pública, Cuando se envía, Entonces se rechaza porque el registro está deshabilitado.
- **HR-F010-AC5:** Dada una petición no autenticada a una operación de la API distinta del inicio de sesión o los health checks, Cuando se envía, Entonces se rechaza como no autorizada.
- **HR-F010-AC6:** Dada una cuenta almacenada, Cuando se inspecciona su registro, Entonces la contraseña está almacenada como un hash argon2.
- **HR-F010-AC7:** Dadas dos cuentas creadas en una prueba, Cuando una inicia sesión, Entonces no puede leer ni modificar los favoritos ni las búsquedas guardadas de la otra.
- **HR-F010-AC8:** Dado un usuario autenticado, Cuando cambia su contraseña con la contraseña actual correcta, Entonces la nueva contraseña funciona y la antigua no.
- **HR-F010-AC9:** Dado un usuario autenticado, Cuando cambia su zona horaria, Entonces las fechas se muestran en esa zona horaria.
- **HR-F010-AC10:** Dado que el seed ya se ejecutó, Cuando se ejecuta de nuevo, Entonces falla, no se crea una segunda cuenta y la existente no se sobrescribe.
- **HR-F010-AC11:** Dado el comando seed con credenciales en variables de entorno, Cuando se ejecuta y no existe ninguna cuenta, Entonces se crea la cuenta con esas credenciales.
- **HR-F010-AC12:** Dado un inicio de sesión correcto, Cuando se crea la sesión, Entonces se almacena en el servidor, en Redis, y el navegador recibe una cookie httpOnly.
- **HR-F010-AC13:** Dada una sesión activa, Cuando el usuario hace una petición, Entonces su expiración se amplía a 7 días desde esa petición.
- **HR-F010-AC14:** Dada una contraseña de menos de 12 caracteres, Cuando el usuario la establece, Entonces se rechaza.
- **HR-F010-AC15:** Dada una cuenta con 5 inicios de sesión fallidos consecutivos, Cuando se intenta un nuevo inicio de sesión dentro de los 15 minutos, Entonces se rechaza, incluso con la contraseña correcta.

## Casos límite

- Intentos de inicio de sesión tras expirar la sesión: se pide al usuario que inicie sesión de nuevo y vuelve a la página en la que estaba.
- Un cambio de contraseña con una contraseña actual errónea: se rechaza, sin cambios.
- Seed ejecutado sin credenciales: falla con un mensaje claro y no crea nada.
- Un valor de zona horaria no válido: se rechaza.
- Cerrar sesión: la sesión se invalida.

## Fuera de alcance (MVP)

- Registro público, invitaciones y roles.
- Recuperación de contraseña por correo electrónico y autenticación de dos factores.
- Migración a OIDC o a un proveedor de identidad SaaS (un adaptador futuro).

## Decisiones relacionadas

[D4](/es/adr/d04-backend-framework/), [D10](/es/adr/d10-cross-cutting-architecture/), [D12](/es/adr/d12-web-internationalization/), [D13](/es/adr/d13-users-and-authentication/).
