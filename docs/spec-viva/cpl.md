# Cuentas y acceso

## Purpose

Permitir que una persona cree una cuenta en FlowSync, inicie y cierre sesión, y consulte su perfil, tanto a través de la API como desde la interfaz web, de forma que solo quien tiene sesión válida accede a las pantallas privadas.

## Requirements

### Requirement: Registro de cuenta por API

El sistema SHALL permitir crear una cuenta nueva enviando nombre (opcional), email, contraseña y confirmación de contraseña, y SHALL devolver en la misma respuesta los datos públicos del usuario y un token de acceso ya utilizable.

#### Scenario: Registro correcto

- **WHEN** se envía `POST /api/v1/auth/signup` con `fullName` (texto o `null`), un `email` válido no registrado, una `password` de entre 8 y 32 caracteres y una `passwordConfirmation` idéntica
- **THEN** la respuesta es un 200 con cuerpo `{ data: { user, token } }`, donde `user` contiene `id`, `fullName`, `email`, `createdAt`, `updatedAt` e `initials`, nunca la contraseña, y `token` es una cadena que sirve como credencial Bearer

#### Scenario: Registro sin nombre

- **WHEN** se registra una cuenta con `fullName: null`
- **THEN** el registro se acepta y el usuario devuelto tiene `fullName` a `null`

### Requirement: Validación del registro

El sistema SHALL rechazar el registro con un 422 y una lista de errores por campo cuando los datos no cumplen las reglas.

#### Scenario: Email ya registrado

- **WHEN** se intenta registrar una cuenta con un email que ya pertenece a otra cuenta
- **THEN** la respuesta es un 422 con un error sobre el campo `email` y no se crea ninguna cuenta

#### Scenario: Email mal formado o demasiado largo

- **WHEN** el `email` no tiene formato de email o supera los 254 caracteres
- **THEN** la respuesta es un 422 con un error sobre el campo `email`

#### Scenario: Contraseña fuera de longitud

- **WHEN** la `password` tiene menos de 8 o más de 32 caracteres
- **THEN** la respuesta es un 422 con un error sobre el campo `password`

#### Scenario: Confirmación distinta

- **WHEN** la `passwordConfirmation` no coincide con la `password`
- **THEN** la respuesta es un 422 con un error sobre el campo `passwordConfirmation`

#### Scenario: Campo obligatorio ausente

- **WHEN** falta en el cuerpo alguno de `email`, `password`, `passwordConfirmation` o la clave `fullName`
- **THEN** la respuesta es un 422 con un error de campo requerido sobre el campo ausente

### Requirement: Inicio de sesión por API

El sistema SHALL emitir un token de acceso nuevo a quien presente un email y una contraseña que correspondan a una cuenta existente.

#### Scenario: Credenciales correctas

- **WHEN** se envía `POST /api/v1/auth/login` con el email y la contraseña de una cuenta existente
- **THEN** la respuesta es un 200 con `{ data: { user, token } }`, con la misma forma de `user` que en el registro

#### Scenario: Credenciales incorrectas

- **WHEN** el email no existe o la contraseña no es la de esa cuenta
- **THEN** la respuesta es un 400 con un error genérico, idéntico en ambos casos, sin indicar cuál de los dos datos falló

#### Scenario: Datos de login mal formados

- **WHEN** falta el email o la contraseña, o el email no tiene formato de email
- **THEN** la respuesta es un 422 con errores por campo, sin llegar a comprobar las credenciales

#### Scenario: Varios inicios de sesión

- **WHEN** la misma cuenta inicia sesión varias veces
- **THEN** cada inicio devuelve un token distinto y todos siguen siendo válidos a la vez

### Requirement: Acceso autenticado a la cuenta

El sistema SHALL exigir un token Bearer válido para consultar el perfil y para cerrar sesión, y SHALL responder 401 en caso contrario.

#### Scenario: Consultar el perfil con token válido

- **WHEN** se envía `GET /api/v1/account/profile` con cabecera `Authorization: Bearer <token>` válido
- **THEN** la respuesta es un 200 con `{ data: user }` del dueño del token

#### Scenario: Sin token o con token inválido

- **WHEN** se llama a `GET /api/v1/account/profile` o a `POST /api/v1/account/logout` sin cabecera de autorización, o con un token inexistente o ya revocado
- **THEN** la respuesta es un 401

### Requirement: Cierre de sesión por API

El sistema SHALL revocar el token con el que se hace la petición de cierre de sesión, y solo ese.

#### Scenario: Cerrar sesión

- **WHEN** se envía `POST /api/v1/account/logout` con un token válido
- **THEN** la respuesta es un 200 con `{ message: 'Logged out successfully' }` (sin envoltorio `data`) y ese token deja de ser aceptado a partir de ese momento

#### Scenario: Otros tokens de la misma cuenta

- **WHEN** la cuenta tiene varios tokens activos y se cierra sesión con uno de ellos
- **THEN** los demás tokens siguen siendo válidos

### Requirement: Iniciales del usuario

El sistema SHALL devolver en cada usuario un campo `initials` en mayúsculas calculado a partir del nombre o, si no hay nombre, del email.

#### Scenario: Nombre con dos o más palabras

- **WHEN** el usuario tiene `fullName` "Ada Lovelace"
- **THEN** `initials` es "AL" (primera letra de las dos primeras palabras)

#### Scenario: Nombre de una sola palabra

- **WHEN** el usuario tiene `fullName` "Ada"
- **THEN** `initials` es "AD" (las dos primeras letras)

#### Scenario: Sin nombre

- **WHEN** el usuario no tiene `fullName` y su email es "ada@example.com"
- **THEN** `initials` es "AE" (primera letra de lo que va antes y de lo que va después de la arroba)

### Requirement: Respuestas siempre en JSON

El sistema SHALL responder en JSON a cualquier petición de la API, independientemente de la cabecera `Accept` que envíe el cliente, incluidos los errores.

#### Scenario: Error sin pedir JSON

- **WHEN** se envía una petición inválida a cualquier ruta del vertical sin cabecera `Accept: application/json`
- **THEN** el error llega como JSON con la forma `{ errors: [...] }`

### Requirement: Pantalla de registro

La interfaz SHALL ofrecer en `/register` un formulario con nombre completo (marcado como opcional), email, contraseña y repetición de contraseña, que al completarse con éxito deja a la persona con la sesión iniciada.

#### Scenario: Registro correcto desde la interfaz

- **WHEN** una persona sin sesión rellena el formulario con datos válidos y pulsa "Crear cuenta"
- **THEN** el botón muestra "Creando cuenta…" y queda deshabilitado mientras espera, y al terminar la persona ve su perfil

#### Scenario: Contraseñas distintas

- **WHEN** la contraseña y su repetición no coinciden al pulsar "Crear cuenta"
- **THEN** aparece "Las contraseñas no coinciden." bajo el campo de repetición, sin que se envíe nada al servidor

#### Scenario: Email ya registrado desde la interfaz

- **WHEN** la persona intenta registrarse con un email ya existente
- **THEN** aparece "Ese email ya está registrado. Inicia sesión en su lugar." bajo el campo email

#### Scenario: Nombre en blanco

- **WHEN** el campo de nombre se deja vacío o solo con espacios
- **THEN** la cuenta se crea sin nombre y el perfil muestra "Sin nombre"

#### Scenario: Ayuda de contraseña

- **WHEN** el campo contraseña no tiene error
- **THEN** debajo se muestra "Entre 8 y 32 caracteres."; si tiene error, el error sustituye a esa ayuda

### Requirement: Pantalla de inicio de sesión

La interfaz SHALL ofrecer en `/login` un formulario de email y contraseña que al completarse con éxito lleva al perfil.

#### Scenario: Login correcto desde la interfaz

- **WHEN** una persona sin sesión introduce credenciales correctas y pulsa "Entrar"
- **THEN** el botón muestra "Entrando…" mientras espera y después la persona ve su perfil

#### Scenario: Credenciales incorrectas desde la interfaz

- **WHEN** las credenciales no son correctas
- **THEN** aparece un aviso destacado arriba del formulario con "El email o la contraseña no son correctos."

#### Scenario: Error de validación en un campo

- **WHEN** el servidor rechaza un campo que el formulario muestra (por ejemplo, el email mal formado)
- **THEN** el mensaje aparece en castellano bajo ese campo y no hay aviso general arriba

#### Scenario: Servidor inaccesible

- **WHEN** el servidor no responde al enviar el formulario
- **THEN** aparece arriba "No se pudo conectar con el servidor. Comprueba que el backend está arrancado."

#### Scenario: Navegación entre pantallas de acceso

- **WHEN** la persona está en el login o en el registro
- **THEN** ve un enlace para ir a la otra pantalla ("Crea una" / "Inicia sesión")

### Requirement: Perfil y cierre de sesión en la interfaz

La interfaz SHALL mostrar en `/profile` las iniciales, el nombre (o "Sin nombre"), el email y la fecha de alta de la persona con sesión, y un botón para cerrar sesión.

#### Scenario: Ver el perfil

- **WHEN** una persona con sesión abre `/profile`
- **THEN** ve un círculo con sus iniciales, su nombre, su email y "Miembro desde" con la fecha de alta en formato largo en castellano

#### Scenario: Cerrar sesión

- **WHEN** la persona pulsa "Cerrar sesión"
- **THEN** vuelve a la pantalla de login y, al recargar, sigue sin sesión, aunque el servidor no haya podido confirmar el cierre

### Requirement: Protección de rutas en la interfaz

La interfaz SHALL permitir el perfil solo con sesión, y SHALL impedir el login y el registro cuando ya hay sesión.

#### Scenario: Pantalla privada sin sesión

- **WHEN** una persona sin sesión abre `/profile`
- **THEN** es redirigida a `/login`

#### Scenario: Pantallas públicas con sesión

- **WHEN** una persona con sesión abre `/login` o `/register`
- **THEN** es redirigida a `/profile`

#### Scenario: Ruta desconocida

- **WHEN** se abre cualquier otra dirección (incluida la raíz)
- **THEN** se redirige a `/profile`, y de ahí a `/login` si no hay sesión

### Requirement: Persistencia de la sesión en el navegador

La interfaz SHALL mantener la sesión al recargar la página, validándola contra el servidor antes de mostrar pantallas que dependan de ella.

#### Scenario: Recarga con sesión válida

- **WHEN** una persona con sesión recarga la página
- **THEN** ve un indicador de carga a pantalla completa y después la pantalla en la que estaba, sin volver a iniciar sesión

#### Scenario: Recarga con sesión revocada

- **WHEN** se recarga la página y el servidor ya no acepta la sesión guardada
- **THEN** la persona acaba en el login con el aviso "Tu sesión ha caducado. Vuelve a iniciar sesión." y la sesión guardada se descarta

#### Scenario: Recarga con el servidor caído

- **WHEN** se recarga la página y el servidor no responde
- **THEN** la persona acaba en el login con el aviso de que no se pudo conectar, pero la sesión guardada se conserva y, al recargar con el servidor de vuelta, se recupera sin iniciar sesión

---

# Parte B

## 1. Requisitos escritos y comprobados

- Escritos por el agente: 12 requisitos (37 escenarios)
- Comprobados por mí abriendo el código: 0

## 2. Incoherencias

- El cierre de sesión responde `{ message }` sin el envoltorio `{ data }` que llevan todas las demás respuestas del vertical, y el mensaje está en inglés (acción de logout en el backend).
- El registro crea un recurso y responde 200, no 201 (acción de signup en el backend).
- Los tokens no tienen caducidad configurada, pero la interfaz trata cualquier 401 como "Tu sesión ha caducado" (traducción de errores en el cliente de API del frontend).
- La interfaz traduce cualquier 400 como "email o contraseña incorrectos", sea cual sea su causa (misma traducción de errores del frontend).
- La contraseña del registro está limitada a 8–32 caracteres; la del login acepta cualquier cadena (validadores del backend).
- El nombre no tiene longitud máxima en la validación, mientras que el email sí (254) (validadores del backend).
- El formulario de registro declara `minLength=8` en la contraseña, pero el formulario lleva `noValidate` y el navegador nunca lo aplica (pantalla de registro).
- El comentario de la rehidratación dice que el token "se conserva" cuando el servidor está caído, y es cierto en almacenamiento, pero la persona queda como anónima y va al login: la sesión se conserva y a la vez no está disponible (proveedor de sesión del frontend).

## 3. Bug o contrato

- **Iniciales desde el email**: con `ada.lovelace@example.com` y sin nombre salen "AE" (primera letra del usuario y del dominio). O es una regla deliberada ("dos letras siempre que se pueda") o es un bug de trocear el email por la `@` en vez de quedarse con la parte local.
- **Iniciales con tres palabras**: "Ana María López" da "AM", no "AL". Puede ser la regla (las dos primeras palabras) o la intención era nombre + último apellido.
- **Mayúsculas en el email**: nada normaliza el email, así que `Ada@x.com` y `ada@x.com` podrían ser dos cuentas distintas y el login ser sensible a mayúsculas. Puede ser contrato (el email se guarda tal cual) o bug (el email es un identificador sin distinguir mayúsculas). No lo he confirmado ejecutándolo.
- **Enumeración de cuentas**: el login responde igual si el email no existe o si la contraseña falla (esto oculta qué cuentas existen), pero el registro dice explícitamente "Ese email ya está registrado". Las dos lecturas se contradicen: o ocultar qué cuentas existen es un requisito, y el registro lo rompe, o no lo es, y el mensaje genérico del login es una casualidad de la librería.
- **Tokens sin caducidad y logout de un solo token**: cerrar sesión solo revoca el token de ese dispositivo y los tokens no caducan nunca. Puede ser una decisión (sesiones multi-dispositivo persistentes) o algo que simplemente nadie configuró. Desde fuera solo se confirma esperando.
