# SPECFixes1: Correcciones Transversales de Calidad de Código

> **Origen:** Code Reviews #1, #2, #3, #4, #5 — Hallazgos recurrentes que afectan múltiples componentes.
> **Prioridad:** Alta — Estos problemas cruzan todas las features y deben abordarse antes de que el código se acerque a un entorno de producción.

---

| Campo | Descripción y criterio de calidad |
| --- | --- |
| **Nombre de la feature** | Correcciones Transversales de Calidad de Código (Cross-Cutting Code Quality Fixes) |
| **Descripción general** | Conjunto de correcciones derivadas de las revisiones de código que abordan tres categorías: **(a)** eliminación de `console.error`/`console.warn` en código productivo, **(b)** reemplazo de `alert()` nativo por el `ToastService` existente, y **(c)** protección del fallback de mock authentication con un flag de entorno. Estos cambios no alteran funcionalidad de negocio sino la robustez y seguridad del código. |
| **Archivos involucrados** | - `src/app/features/tasks/feature/task-list/task-list.component.ts` (CR #1) |
|  | - `src/app/features/tasks/feature/task-detail/task-detail.component.ts` (CR #4) |
|  | - `src/app/features/projects/feature/project-detail/project-detail.component.ts` (CR #7) |
|  | - `src/app/features/projects/feature/project-list/project-list.component.ts` (CR #6) |
|  | - `src/app/core/interceptors/auth.interceptor.ts` (CR #5) |
|  | - `src/app/core/interceptors/error.interceptor.ts` (CR #9) |
|  | - `src/app/core/services/auth.service.ts` (CR #5) |
|  | - `src/environments/environment.ts` |
|  | - `src/environments/environment.development.ts` |
| **Restricciones de negocio** | 1. **Cero `console.error` / `console.warn` en producción:** Todo log de depuración debe eliminarse o reemplazarse por un mecanismo controlado (como el `ToastService` para feedback al usuario, o simplemente omitirlo si la información solo era útil para debugging local). Se acepta mantener `console.warn` **exclusivamente** en el `AuthService` para el fallback mock, ya que ese bloque solo se ejecutará cuando `environment.useMockAuth` sea `true`. |
|  | 2. **Cero `alert()` nativo:** El proyecto ya cuenta con un `ToastService` basado en Signals (SPEC 9). Cualquier uso de `window.alert()` es inconsistente con la arquitectura y degrada la UX. Los mensajes de error de comentarios fallidos en `TaskDetailComponent` deben utilizar una Signal local (`commentError`) que renderice el feedback en el template, o inyectar el `ToastService` para una notificación flotante. |
|  | 3. **Flag de entorno para Mock Auth (Riesgo de Seguridad):** El fallback de autenticación mock en `AuthService.login()` actualmente se activa cuando `error.status === 404 \|\| error.status === 0`. Esto significa que si el backend real cae (devolviendo `status 0` por error de red), **cualquier usuario podría autenticarse con cualquier email** en un entorno de producción. Este fallback debe estar condicionado a un flag `environment.useMockAuth` que sea `true` únicamente en `environment.development.ts` y `false` en `environment.ts`. |

---

### Lineamientos técnicos

#### Fix 1a: Eliminación de `console.error` y `console.warn`

**Estado actual verificado en el código:**

| Archivo | Línea(s) | Sentencia |
| --- | --- | --- |
| `task-list.component.ts` | L77 | `console.error('Failed to fetch tasks:', errorResponse);` |
| `task-detail.component.ts` | L150 | `console.error('Failed to add comment', error);` |
| `project-detail.component.ts` | L222 | `console.error('Failed to load project dashboard details:', err);` |
| `project-list.component.ts` | L174 | `console.error('Failed to load projects:', err);` |
| `auth.interceptor.ts` | L24 | `console.warn('Unauthorized request (401) detected...');` |
| `error.interceptor.ts` | L20 | `console.warn('Session expired or unauthorized (401)...');` |
| `auth.service.ts` | L51 | `console.warn('Authentication endpoint not found on mock server...');` |

**Acción requerida:**
- **Eliminar** todas las sentencias `console.error` en los componentes de feature. El manejo de error ya actualiza la Signal correspondiente (`errorMessage`, `globalError`, `error`) que se muestra en la UI.
- **Eliminar** los `console.warn` de los interceptores. El comportamiento (logout automático o redirección) ya es autoexplicativo.
- **Conservar** el `console.warn` del `auth.service.ts` (L51) **solo si** queda protegido detrás del flag `useMockAuth` (ver Fix 1c).

#### Fix 1b: Reemplazo de `alert()` por Signal de error o `ToastService`

**Estado actual verificado:**

En `task-detail.component.ts` línea 152:
```typescript
alert('Failed to add comment. Please try again.');
```

**Acción requerida — Opción recomendada (Signal local):**
1. Agregar una Signal `commentError` al componente:
   ```typescript
   public readonly commentError = signal<string | null>(null);
   ```
2. En el bloque `error` de `handleNewComment()`, reemplazar el `alert()`:
   ```typescript
   error: (error: HttpErrorResponse) => {
     this.isSubmittingComment.set(false);
     this.commentError.set('No se pudo agregar el comentario. Intente nuevamente.');
   }
   ```
3. Renderizar el error en el template, debajo del `<app-comment-form>`:
   ```html
   @if (commentError()) {
     <p class="text-sm text-red-600 mt-2">{{ commentError() }}</p>
   }
   ```
4. Limpiar el `commentError` al inicio de cada intento: `this.commentError.set(null);`

**Opción alternativa (ToastService):**
Inyectar `ToastService` y llamar `this.toastService.show('...', 'error')`. Válida si se prefiere mantener el componente más limpio, pero menos contextual.

#### Fix 1c: Flag de entorno `useMockAuth`

**Estado actual verificado en `auth.service.ts`:**
```typescript
if (error.status === 404 || error.status === 0) {
  // ... simula login exitoso con mock token
}
```

**Acción requerida:**
1. Agregar la propiedad `useMockAuth` a ambos archivos de entorno:

   `environment.development.ts`:
   ```typescript
   export const environment = {
     apiUrl: 'http://localhost:3000',
     useMockAuth: true
   };
   ```

   `environment.ts` (producción):
   ```typescript
   export const environment = {
     apiUrl: 'http://localhost:8080/api',
     useMockAuth: false
   };
   ```

2. Condicionar el fallback en `AuthService.login()`:
   ```typescript
   catchError((error: HttpErrorResponse) => {
     if (environment.useMockAuth && (error.status === 404 || error.status === 0)) {
       // ... lógica de mock existente ...
     }
     return throwError(() => error);
   })
   ```

---

### Criterios de aceptación

**Criterio 1 (Código limpio de logs):**

**Dado** que se realiza una revisión de código en los archivos de componentes de feature y en los interceptores,

**Cuando** el evaluador busca sentencias `console.error` o `console.warn`,

**Entonces** no encuentra ninguna en código productivo, excepto opcionalmente dentro de un bloque protegido por `environment.useMockAuth`.


**Criterio 2 (Eliminación de `alert()` nativo):**

**Dado** que el usuario está en la vista de detalle de tarea e intenta agregar un comentario,

**Cuando** la petición `POST` para crear el comentario falla,

**Entonces** el mensaje de error se muestra dentro de la UI del componente (como texto en la sección de comentarios o como toast flotante) y **no** aparece un cuadro de diálogo nativo del navegador (`alert`).


**Criterio 3 (Mock Auth protegido por flag):**

**Dado** que la aplicación se compila para producción (`ng build`),

**Cuando** el backend real no está disponible y la petición de login falla con `status 0`,

**Entonces** el `AuthService` **no** genera un mock token y propaga el error para que la UI muestre "Error de conexión", impidiendo la autenticación fraudulenta.


**Criterio 4 (Mock Auth funcional en desarrollo):**

**Dado** que un desarrollador ejecuta la aplicación con `ng serve` (entorno development),

**Cuando** la petición de login falla porque el mock server no expone `/auth/login`,

**Entonces** el fallback genera un token simulado y el desarrollador puede continuar trabajando en el frontend sin backend real.

