### SPEC 5: Autenticación, Sesión y Seguridad (Auth & Guards)

| Campo | Descripción y criterio de calidad |
| --- | --- |
| **Nombre de la feature** | Autenticación de Usuario, JWT y Protección de Rutas |
| **Descripción general** | El sistema debe permitir a un usuario autenticarse mediante email y contraseña, gestionar su sesión global de forma reactiva y proteger el acceso a las vistas internas (Proyectos, Tareas). Además, debe asegurar que toda comunicación con el backend incluya el token de identidad. |
| **Endpoints involucrados** | - `POST /auth/login` (Asumiendo el estándar de Spring Security que implementaremos/simularemos).

  
- Afecta indirectamente a **todos** los endpoints de la API, ya que inyectará el header de autorización. |
| **Restricciones de negocio** | 1. **Credenciales obligatorias:** El formulario de login requiere un email con formato válido y una contraseña que no esté en blanco.

  
2. **Protección de recursos:** Un usuario no autenticado que intente acceder a rutas privadas (ej. `/projects` o `/tasks`) debe ser redirigido obligatoriamente a `/login`.

  
3. **Autorización en red:** Toda petición HTTP dirigida a la API REST (excepto la de login) debe incluir el encabezado `Authorization: Bearer <jwt_token>`.

  
4. **Cierre de sesión automático:** Si el backend devuelve un error `401 Unauthorized` (indicando que el token expiró o es inválido), el sistema debe destruir la sesión local y redirigir al login. |
| **Lineamientos técnicos** | - **Formularios:** Uso de **Reactive Forms** en el `LoginComponent` (Standalone) para validar el formato de correo y la completitud del password.

  
- **Estado Global:** Creación de un `AuthService` que exponga una **Signal** (ej. `isAuthenticated()`) para que componentes transversales (como el Navbar) reaccionen instantáneamente a los cambios de sesión.

  
- **Seguridad de Rutas:** Implementación de Functional Route Guards (`CanActivateFn`) nativos de Angular 21.

  
- **Intercepción HTTP:** Uso de `HttpInterceptorFn` para clonar las peticiones e inyectar el JWT almacenado (en `localStorage` o `sessionStorage`). |
| **Criterios de aceptación** | **Criterio 1 (Login exitoso y Estado):**

  
**Dado** que un usuario no autenticado ingresa credenciales válidas,

  
**Cuando** envía el formulario,

  
**Entonces** el sistema recibe el JWT, lo almacena localmente, la Signal de estado se actualiza a `true` y el usuario es redirigido al listado de proyectos.

  
  
**Criterio 2 (Inyección de Token - Interceptor):**

  
**Dado** que el usuario posee una sesión activa (JWT guardado),

  
**Cuando** navega a la vista de "Mis Tareas" y el sistema ejecuta el `GET`,

  
**Entonces** la petición HTTP saliente incluye el header `Authorization: Bearer <token>`.

  
  
**Criterio 3 (Protección de Rutas - Guard):**

  
**Dado** que un usuario sin sesión activa (no hay token guardado),

  
**Cuando** intenta acceder directamente a la URL `/projects/new` en el navegador,

  
**Entonces** el Route Guard bloquea el renderizado del componente y lo redirige a la vista `/login`.

  
  
**Criterio 4 (Credenciales Inválidas - 401):**

  
**Dado** que un usuario ingresa una contraseña incorrecta,

  
**Cuando** el backend responde con un error `401 Unauthorized`,

  
**Entonces** la UI captura el error y muestra un mensaje en pantalla indicando "Credenciales incorrectas".

  
  
**Criterio 5 (Logout automático por token expirado):**

  
**Dado** que el usuario tiene una sesión activa pero su JWT ha expirado en el servidor,

  
**Cuando** cualquier petición HTTP de la aplicación recibe un `401 Unauthorized` como respuesta,

  
**Entonces** el interceptor HTTP destruye la sesión local (limpia localStorage y resetea las Signals de autenticación) y redirige automáticamente a `/login` sin intervención del usuario. |

