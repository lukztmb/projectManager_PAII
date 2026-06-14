# Plan de Implementación: Sistema de Autenticación, Sesión y Seguridad (Auth & Guards)

Este plan describe la arquitectura y los pasos para implementar el sistema de autenticación y protección de rutas en el frontend de la aplicación Angular 21, de acuerdo con el contrato definido en `SPEC5.md`.

## User Review Required

> [!IMPORTANT]
> **Intercepción de 401 y Cierre de Sesión:** Cuando el backend responde con un error `401 Unauthorized`, el `authInterceptor` destruirá automáticamente la sesión local y redirigirá al usuario a `/login`.
>
> **Simulación en Servidor Mock:** Dado que el servidor mock (`json-server` en el puerto 3000) no proporciona un endpoint real de autenticación `/api/auth/login`, hemos diseñado el `AuthService` para que, en caso de fallar la petición HTTP (o devolver un `404` del mock), simule un inicio de sesión exitoso con credenciales normales y devuelva un `401` controlado si la contraseña es `'wrong'` o el email es `'wrong@example.com'`. Esto permite probar tanto el flujo feliz como el de error sin modificar el contenedor Docker del servidor mock.

---

## Proposed Changes

### 1. Core Module (Security Infrastructure)

#### [NEW] [auth.service.ts](projectManager/angular-app/src/app/core/services/auth.service.ts)
- Creación de un servicio global `AuthService` utilizando Angular Signals para la reactividad del estado de sesión:
  - `isAuthenticated = signal<boolean>(false)` (Read-only signal).
  - `currentUser = signal<{ email: string } | null>(null)` (Read-only signal).
  - `token = signal<string | null>(null)` (Read-only signal).
  - Método `login(email, password)` que realiza la petición POST a `/api/auth/login` y persiste el JWT en `localStorage`. Incluye la lógica de simulación/fallback para el servidor mock local.
  - Método `logout()` que limpia el `localStorage`, actualiza las Signals a sus valores iniciales y redirige a `/login`.
  - Método `loadSession()` en el constructor para restaurar la sesión persistida si el usuario recarga la página.

#### [NEW] [auth.guard.ts](projectManager/angular-app/src/app/core/guards/auth.guard.ts)
- Implementación de un Functional Route Guard (`CanActivateFn`):
  - Inyecta `AuthService` y `Router`.
  - Valida si `authService.isAuthenticated()` es `true`.
  - Si no lo es, redirige al usuario a `/login` y retorna `false`.

#### [NEW] [auth.interceptor.ts](projectManager/angular-app/src/app/core/interceptors/auth.interceptor.ts)
- Implementación de un Functional HTTP Interceptor (`HttpInterceptorFn`):
  - Obtiene el token activo desde `AuthService`.
  - Si el token existe, clona la petición saliente agregando el encabezado `Authorization: Bearer <token>`.
  - Captura las respuestas del servidor y, en caso de recibir un error HTTP `401 Unauthorized`, invoca a `authService.logout()` para realizar la limpieza de sesión y redirección automática.

---

### 2. Auth Feature (Authentication Views)

#### [NEW] [login.component.ts](projectManager/angular-app/src/app/features/auth/feature/login/login.component.ts)
- Componente standalone para la pantalla de inicio de sesión:
  - Formulario reactivo (`ReactiveFormsModule`) con validaciones de email (formato válido y obligatorio) y contraseña (obligatoria).
  - Integración visual con Tailwind CSS utilizando un diseño premium (gradientes fluidos, sombras premium, bordes suaves estilo glassmorphism e indicadores visuales de carga).
  - Manejo de estados de carga (`isLoading` de tipo Signal o booleano local) y captura de errores (mostrando el mensaje "Credenciales incorrectas" ante un error 401).

---

### 3. Application Configuration & Routing

#### [MODIFY] [app.config.ts](projectManager/angular-app/src/app/app.config.ts)
- Registro del interceptor HTTP funcional utilizando `withInterceptors([authInterceptor])` dentro de `provideHttpClient()`.
- Limpieza de la duplicación de `provideRouter` que existe actualmente en el archivo.

#### [MODIFY] [app.routes.ts](projectManager/angular-app/src/app/app.routes.ts)
- Adición de la ruta para `/login` apuntando al `LoginComponent`.
- Protección de todas las rutas privadas existentes (`tasks/in-progress`, `projects/create`, etc.) utilizando la propiedad `canActivate: [authGuard]`.

#### [MODIFY] [app.html](projectManager/angular-app/src/app/app.html)
- Ocultar o eliminar la visualización directa del componente `<app-home>` si el usuario no está autenticado, o condicionar el diseño de la aplicación para que no renderice el menú o componentes de la vista privada si el usuario está en `/login`.
- *Propuesta de diseño premium:* Si el usuario está autenticado, renderizar una barra de navegación/sidebar con su correo y un botón elegante de "Cerrar sesión" que reaccione instantáneamente gracias a la reactividad de Signals de `AuthService`. Si está en la pantalla de login, renderizar únicamente el router-outlet.

---

## Verification Plan

### Automated Tests
Para validar el correcto funcionamiento de las unidades de software:
- Ejecutar pruebas unitarias mediante `npm run test` (si existen/se configuran specs de vitest) o validar la correcta compilación del proyecto con `npm run build`.

### Manual Verification
1. **Acceso no autenticado (Guard):** Intentar entrar directamente a `http://localhost:4200/tasks/in-progress` sin sesión activa y verificar la redirección automática a `http://localhost:4200/login`.
2. **Login fallido (Credenciales inválidas):** En el formulario de login, ingresar contraseña `'wrong'` (o email `'wrong@example.com'`) y comprobar que la interfaz muestra de forma estilizada el mensaje "Credenciales incorrectas" (Criterio 4).
3. **Login exitoso (Flujo feliz):** Ingresar credenciales válidas (ej. `admin@example.com` / `password`), verificar que se genera un token de prueba, se almacena en `localStorage`, la Signal de autenticación cambia a `true`, y el usuario es redirigido correctamente a la página de inicio/tareas (Criterio 1).
4. **Envío de token (Interceptor):** Verificar en la pestaña Network del navegador que las peticiones HTTP subsiguientes (ej. al cargar tareas) incluyen el header `Authorization: Bearer mock-jwt-token-...` (Criterio 2).
5. **Cierre de sesión automático (401 del servidor):** Simular una expiración de sesión (o forzar un error 401 en un request) y verificar que el interceptor destruye las variables de sesión y redirige inmediatamente al login (Restricción de negocio 4).
6. **Cierre de sesión voluntario (Logout):** Hacer clic en el botón de logout de la barra de navegación y verificar la correcta desconexión y redirección.
