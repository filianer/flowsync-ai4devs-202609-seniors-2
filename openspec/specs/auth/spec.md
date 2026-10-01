# auth Specification

## Purpose

Permite que una persona cree una cuenta en FlowSync, inicie y cierre sesión, y consulte su perfil. La API identifica a quien llama mediante un token de acceso opaco, y la aplicación web guarda ese token para mantener la sesión abierta entre visitas.

## Requirements

### Requirement: Registro de una cuenta nueva

El sistema SHALL aceptar en `POST /api/v1/auth/signup` un cuerpo JSON con `fullName`, `email`, `password` y `passwordConfirmation`. Si los datos son válidos, SHALL crear la cuenta y responder con éxito, sin necesidad de un inicio de sesión aparte, con un cuerpo `{ "data": { "user": <perfil>, "token": <token de acceso> } }`. El token devuelto SHALL servir de inmediato para acceder a las rutas protegidas.

#### Scenario: Registro correcto con nombre

- **WHEN** se envía `fullName: "Ada Lovelace"`, `email: "ada@example.com"`, `password: "secreto123"` y `passwordConfirmation: "secreto123"`, y no existe ninguna cuenta con ese email
- **THEN** la respuesta es 200 y contiene `data.user` con `fullName: "Ada Lovelace"` y `email: "ada@example.com"`, y `data.token` es una cadena no vacía

#### Scenario: Registro correcto sin nombre

- **WHEN** se envía `fullName: null` junto con un email libre y una contraseña válida que coincide con su confirmación
- **THEN** la respuesta es 200 y `data.user.fullName` es `null`

#### Scenario: El token del registro ya abre una sesión

- **WHEN** se usa el `data.token` recibido al registrarse en la cabecera `Authorization: Bearer <token>` de `GET /api/v1/account/profile`
- **THEN** la respuesta es 200 y devuelve el perfil de la cuenta recién creada

### Requirement: Validación de los datos de registro

El sistema SHALL rechazar el registro con una respuesta 422 y un cuerpo `{ "errors": [...] }` cuando los datos no cumplan las reglas. Cada error SHALL indicar el `field` afectado, la `rule` incumplida y un `message`. Las reglas son: `fullName` debe estar presente, aunque sea `null`; `email` debe ser un email con formato válido, de 254 caracteres como máximo, y no estar ya registrado; `password` debe tener entre 8 y 32 caracteres; `passwordConfirmation` debe tener entre 8 y 32 caracteres y ser idéntica a `password`. Cuando el registro se rechaza, el sistema MUST NOT crear la cuenta.

#### Scenario: Email ya registrado

- **WHEN** se intenta registrar una cuenta con un email que ya pertenece a otra cuenta
- **THEN** la respuesta es 422 con un error sobre `email` y regla `database.unique`, y no se crea una segunda cuenta

#### Scenario: Contraseña demasiado corta

- **WHEN** se envía una `password` de menos de 8 caracteres
- **THEN** la respuesta es 422 con un error sobre `password` y regla `minLength`

#### Scenario: Contraseña demasiado larga

- **WHEN** se envía una `password` de más de 32 caracteres
- **THEN** la respuesta es 422 con un error sobre `password` y regla `maxLength`

#### Scenario: Confirmación que no coincide

- **WHEN** `passwordConfirmation` tiene una longitud válida pero es distinta de `password`
- **THEN** la respuesta es 422 con un error sobre `passwordConfirmation` y regla `sameAs`

#### Scenario: Email con formato inválido

- **WHEN** se envía `email: "no-es-un-email"`
- **THEN** la respuesta es 422 con un error sobre `email` y regla `email`

#### Scenario: Falta la clave del nombre

- **WHEN** el cuerpo no incluye la clave `fullName`
- **THEN** la respuesta es 422 con un error sobre `fullName` y regla `required`

### Requirement: Inicio de sesión con email y contraseña

El sistema SHALL aceptar en `POST /api/v1/auth/login` un cuerpo JSON con `email` y `password`. Si las credenciales son correctas, SHALL emitir un token de acceso nuevo y responder 200 con `{ "data": { "user": <perfil>, "token": <token de acceso> } }`. Cada inicio de sesión correcto SHALL emitir un token distinto, y los tokens emitidos antes SHALL seguir siendo válidos.

#### Scenario: Credenciales correctas

- **WHEN** se envían el email y la contraseña de una cuenta existente
- **THEN** la respuesta es 200 con `data.user` igual al perfil de esa cuenta y un `data.token` nuevo

#### Scenario: Varias sesiones a la vez

- **WHEN** la misma cuenta inicia sesión dos veces y recibe dos tokens
- **THEN** ambos tokens dan acceso a `GET /api/v1/account/profile`

### Requirement: Rechazo de credenciales incorrectas

El sistema SHALL responder 400 a un inicio de sesión con credenciales incorrectas, con un único error genérico y sin `field`. La respuesta MUST NOT revelar si el email existe: una contraseña errónea y un email desconocido SHALL producir la misma respuesta. Si el cuerpo no tiene forma válida (falta un campo, o el email no tiene formato de email o supera los 254 caracteres), el sistema SHALL responder 422 con errores por campo antes de comprobar las credenciales.

#### Scenario: Contraseña incorrecta

- **WHEN** se envía el email de una cuenta existente con una contraseña que no es la suya
- **THEN** la respuesta es 400 con un cuerpo `{ "errors": [ { "message": ... } ] }` sin `field`, y no se emite ningún token

#### Scenario: Email que no existe

- **WHEN** se envía un email con formato válido que no pertenece a ninguna cuenta
- **THEN** la respuesta es la misma que con una contraseña incorrecta: 400 con el mismo error genérico

#### Scenario: Petición incompleta

- **WHEN** se envía un cuerpo sin `password`
- **THEN** la respuesta es 422 con un error sobre `password` y regla `required`

### Requirement: Acceso autenticado mediante token

El sistema SHALL exigir una cabecera `Authorization: Bearer <token>` con un token válido en todas las rutas bajo `/api/v1/account/`. Un token es válido si fue emitido por el registro o por el inicio de sesión y no ha sido revocado al cerrar sesión. Los tokens no caducan por tiempo. Si falta el token, o no es válido, el sistema SHALL responder 401 con un cuerpo `{ "errors": [ { "message": ... } ] }`.

#### Scenario: Sin cabecera de autorización

- **WHEN** se llama a `GET /api/v1/account/profile` sin cabecera `Authorization`
- **THEN** la respuesta es 401

#### Scenario: Token inventado

- **WHEN** se llama a `GET /api/v1/account/profile` con `Authorization: Bearer token-falso`
- **THEN** la respuesta es 401

#### Scenario: Token revocado

- **WHEN** se usa un token sobre el que ya se ha llamado a `POST /api/v1/account/logout`
- **THEN** la respuesta es 401

### Requirement: Consulta del perfil propio

El sistema SHALL devolver en `GET /api/v1/account/profile` el perfil de la cuenta a la que pertenece el token, envuelto como `{ "data": <perfil> }`. El perfil, igual que el que devuelven el registro y el inicio de sesión, SHALL contener exactamente `id`, `fullName`, `email`, `initials`, `createdAt` y `updatedAt`, y MUST NOT contener la contraseña ni ningún derivado de ella.

#### Scenario: Perfil de quien llama

- **WHEN** una cuenta con sesión iniciada llama a `GET /api/v1/account/profile` con su token
- **THEN** la respuesta es 200 con `data.id`, `data.fullName`, `data.email`, `data.initials`, `data.createdAt` y `data.updatedAt` de esa cuenta, y sin ningún campo de contraseña

### Requirement: Iniciales del perfil

El sistema SHALL calcular `initials` en mayúsculas. Si el nombre tiene al menos dos palabras separadas por espacios, las iniciales SHALL ser la primera letra de la primera palabra seguida de la primera letra de la segunda. Si el nombre tiene una sola palabra, SHALL ser sus dos primeras letras. Si no hay nombre, SHALL aplicarse la misma regla al email, partido por la `@`: primera letra de la parte local seguida de la primera letra del dominio.

#### Scenario: Nombre y apellido

- **WHEN** el perfil tiene `fullName: "ada lovelace"`
- **THEN** `initials` es `"AL"`

#### Scenario: Nombre de una sola palabra

- **WHEN** el perfil tiene `fullName: "Ada"`
- **THEN** `initials` es `"AD"`

#### Scenario: Sin nombre

- **WHEN** el perfil tiene `fullName: null` y `email: "ada@example.com"`
- **THEN** `initials` es `"AE"`

### Requirement: Cierre de sesión en el servidor

El sistema SHALL revocar, en `POST /api/v1/account/logout`, solo el token con el que se hace la petición, y responder 200 con `{ "message": "Logged out successfully" }`, sin envoltorio `data`. Los demás tokens de la misma cuenta SHALL seguir siendo válidos.

#### Scenario: Cierre de sesión correcto

- **WHEN** una cuenta con sesión iniciada llama a `POST /api/v1/account/logout` con su token
- **THEN** la respuesta es 200 con `{ "message": "Logged out successfully" }`, y ese token deja de dar acceso a las rutas protegidas

#### Scenario: Las otras sesiones siguen abiertas

- **WHEN** una cuenta tiene dos tokens y cierra sesión con uno de ellos
- **THEN** el otro token sigue dando acceso a `GET /api/v1/account/profile`

### Requirement: Pantalla de registro

La aplicación web SHALL ofrecer en `/register` un formulario de alta con los campos "Nombre completo (opcional)", "Email", "Contraseña" (con la indicación "Entre 8 y 32 caracteres.") y "Repite la contraseña", un botón "Crear cuenta" y un enlace "Inicia sesión" que lleva a `/login`. Si las contraseñas no coinciden, SHALL mostrarlo bajo "Repite la contraseña" sin contactar con el servidor. Si el registro tiene éxito, la persona SHALL quedar con la sesión iniciada y ver su perfil. Mientras se envía el formulario, el botón SHALL mostrar "Creando cuenta…" y estar desactivado.

#### Scenario: Alta correcta

- **WHEN** una persona sin sesión rellena el formulario con datos válidos y pulsa "Crear cuenta"
- **THEN** pasa a ver la pantalla de perfil con sus datos, sin tener que iniciar sesión

#### Scenario: Contraseñas distintas

- **WHEN** la persona escribe contraseñas distintas en "Contraseña" y "Repite la contraseña" y pulsa "Crear cuenta"
- **THEN** ve "Las contraseñas no coinciden." bajo "Repite la contraseña" y no se envía nada al servidor

#### Scenario: Email ya registrado

- **WHEN** la persona intenta registrarse con un email que ya tiene cuenta
- **THEN** ve bajo el campo "Email" el mensaje "Ese email ya está registrado. Inicia sesión en su lugar."

#### Scenario: Nombre en blanco

- **WHEN** la persona deja "Nombre completo" vacío, o solo con espacios, y completa el alta
- **THEN** la cuenta se crea sin nombre y el perfil muestra "Sin nombre"

### Requirement: Pantalla de inicio de sesión

La aplicación web SHALL ofrecer en `/login` un formulario con los campos "Email" y "Contraseña", un botón "Entrar" y un enlace "Crea una" que lleva a `/register`. Si el inicio de sesión tiene éxito, la persona SHALL ver su perfil. Si falla por credenciales incorrectas, SHALL ver un aviso sobre el formulario con el texto "El email o la contraseña no son correctos.". Mientras se envía el formulario, el botón SHALL mostrar "Entrando…" y estar desactivado.

#### Scenario: Inicio de sesión correcto

- **WHEN** una persona sin sesión introduce su email y contraseña y pulsa "Entrar"
- **THEN** pasa a ver su pantalla de perfil

#### Scenario: Credenciales incorrectas

- **WHEN** la persona introduce una contraseña errónea, o un email sin cuenta, y pulsa "Entrar"
- **THEN** ve el aviso "El email o la contraseña no son correctos." y sigue en la pantalla de inicio de sesión

#### Scenario: Servidor inaccesible

- **WHEN** la persona pulsa "Entrar" y el servidor no responde
- **THEN** ve el aviso "No se pudo conectar con el servidor. Comprueba que el backend está arrancado."

### Requirement: Mensajes de error en castellano

La aplicación web SHALL mostrar en castellano los errores que devuelve el servidor. Un error de validación de un campo visible SHALL aparecer bajo ese campo, y si todos los errores caben así, no SHALL aparecer además un aviso general. Un error que no corresponde a ningún campo visible SHALL aparecer como aviso general sobre el formulario. Un fallo inesperado del servidor SHALL mostrarse como "Algo ha ido mal en el servidor. Inténtalo de nuevo en un momento.".

#### Scenario: Contraseña corta en el registro

- **WHEN** la persona se registra con una contraseña de menos de 8 caracteres
- **THEN** ve bajo "Contraseña" el mensaje "la contraseña debe tener al menos 8 caracteres.", en lugar de la indicación "Entre 8 y 32 caracteres."

#### Scenario: Email con formato inválido

- **WHEN** la persona envía un email sin formato válido
- **THEN** ve bajo "Email" el mensaje "Introduce una dirección de email válida."

#### Scenario: Error interno del servidor

- **WHEN** el servidor responde con un error 500 al enviar el formulario
- **THEN** la persona ve el aviso general "Algo ha ido mal en el servidor. Inténtalo de nuevo en un momento."

### Requirement: Pantalla de perfil

La aplicación web SHALL mostrar en `/profile`, a una persona con sesión iniciada, sus iniciales en un círculo, su nombre completo (o "Sin nombre" si no tiene), su email, la fecha de alta como "Miembro desde" en formato largo en español, y un botón "Cerrar sesión".

#### Scenario: Perfil con nombre

- **WHEN** una persona llamada "Ada Lovelace", registrada el 1 de octubre de 2026, abre `/profile` con la sesión iniciada
- **THEN** ve "AL", "Ada Lovelace", su email y "Miembro desde 1 de octubre de 2026"

### Requirement: Persistencia de la sesión en el navegador

La aplicación web SHALL recordar la sesión entre recargas y visitas en el mismo navegador. Al abrir la aplicación con una sesión guardada, SHALL mostrar un indicador de carga mientras la comprueba con el servidor. Si el servidor la acepta, la persona SHALL seguir con la sesión iniciada. Si el servidor la rechaza, la aplicación SHALL olvidarla y llevar a la persona al inicio de sesión con el aviso "Tu sesión ha caducado. Vuelve a iniciar sesión.". Si el servidor no está disponible, SHALL llevar a la persona al inicio de sesión con el aviso correspondiente, pero SHALL conservar la sesión guardada para que una recarga posterior la recupere.

#### Scenario: Recargar con la sesión abierta

- **WHEN** una persona con sesión iniciada recarga la página de perfil
- **THEN** ve brevemente un indicador de carga y después su perfil, sin tener que iniciar sesión otra vez

#### Scenario: Sesión revocada fuera de la aplicación

- **WHEN** la aplicación se abre con una sesión guardada cuyo token el servidor ya no acepta
- **THEN** la persona ve la pantalla de inicio de sesión con el aviso "Tu sesión ha caducado. Vuelve a iniciar sesión."

#### Scenario: Servidor caído al abrir la aplicación

- **WHEN** la aplicación se abre con una sesión guardada y el servidor no responde
- **THEN** la persona ve la pantalla de inicio de sesión con el aviso "No se pudo conectar con el servidor. Comprueba que el backend está arrancado.", y al recargar cuando el servidor vuelve, recupera su sesión

### Requirement: Cierre de sesión desde la aplicación

Al pulsar "Cerrar sesión", la aplicación web SHALL dar la sesión por cerrada en el navegador, aunque el servidor no confirme el cierre, y llevar a la persona a la pantalla de inicio de sesión sin ningún aviso. SHALL pedir también al servidor que revoque el token.

#### Scenario: Cierre de sesión

- **WHEN** una persona con sesión iniciada pulsa "Cerrar sesión" en su perfil
- **THEN** ve la pantalla de inicio de sesión, y al recargar sigue sin sesión

#### Scenario: Cierre de sesión con el servidor caído

- **WHEN** la persona pulsa "Cerrar sesión" y el servidor no responde
- **THEN** igualmente ve la pantalla de inicio de sesión y la sesión queda cerrada en ese navegador

### Requirement: Protección de pantallas según la sesión

La aplicación web SHALL permitir ver `/profile` solo con la sesión iniciada, y `/login` y `/register` solo sin ella. Cualquier otra dirección SHALL redirigir a `/profile`. Mientras se comprueba una sesión guardada, SHALL mostrar un indicador de carga en lugar de redirigir.

#### Scenario: Perfil sin sesión

- **WHEN** una persona sin sesión abre `/profile`
- **THEN** se la redirige a `/login`

#### Scenario: Login con sesión

- **WHEN** una persona con sesión iniciada abre `/login` o `/register`
- **THEN** se la redirige a `/profile`

#### Scenario: Dirección desconocida

- **WHEN** cualquier persona abre una dirección que no existe, como `/`
- **THEN** se la redirige a `/profile`, y desde ahí a `/login` si no tiene sesión
