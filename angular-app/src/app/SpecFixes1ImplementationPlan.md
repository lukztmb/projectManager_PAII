# Plan de Implementación: Correcciones Transversales de Calidad de Código (SPECFixes1)

Este plan aborda las malas prácticas identificadas en la base de código frontend según las especificaciones de `SPECFixes1.md`.

## User Review Required

> [!IMPORTANT]
> Reviso cuidadosamente los cambios propuestos en los interceptores y el servicio de autenticación. El cambio en los `environment.ts` implica que, en producción, cualquier fallo del backend (como un estado `0`) dejará de iniciar sesión automáticamente simulando éxito, exponiendo el error genuinamente en la UI.
> Esto es intencional y aumenta drásticamente la seguridad del aplicativo.

## Propuesta de Cambios

---

### Entornos (Environments)

Se agregará el flag booleano `useMockAuth` para habilitar el fallback únicamente en desarrollo.

#### [MODIFY] environment.ts
- Agregar `useMockAuth: false`

#### [MODIFY] environment.development.ts
- Agregar `useMockAuth: true`

---

### Core Services e Interceptores

Se eliminarán los `console.warn` de los interceptores, que ensucian el entorno de producción. Se aplicará el flag de entorno al servicio de autenticación para mitigar riesgos.

#### [MODIFY] auth.service.ts
- Importar los `environment` adecuadamente.
- Restringir la lógica de validación (mock auth fallback) en la función `login()` condicionándola a `environment.useMockAuth === true`.
- Mantener el `console.warn` únicamente dentro del bloque condicional cuando `useMockAuth` sea verdadero, indicando que se ha entrado en modo simulación.

#### [MODIFY] auth.interceptor.ts
- Eliminar `console.warn('Unauthorized request (401) detected. Automatic logout triggered.');`.

#### [MODIFY] error.interceptor.ts
- Eliminar `console.warn('Session expired or unauthorized (401). Triggering automatic logout.');`.

---

### Componentes y Vistas

Se eliminarán los `console.error` residuales de debugging y se implementará un manejo de errores robusto.

#### [MODIFY] task-detail.component.ts
- Eliminar `console.error('Failed to add comment', error);`.
- Eliminar el uso de la función bloqueante `alert('Failed to add comment. Please try again.');`.
- Agregar un Signal local `public readonly commentError = signal<string | null>(null);`.
- Actualizar el método `handleNewComment()` para asignar el mensaje de error al Signal `commentError` y limpiarlo al iniciar una nueva subida de comentario.
- Modificar el Template embebido para renderizar `<p class="text-sm text-red-600 mt-2">{{ commentError() }}</p>` debajo del componente de formulario si existe un error.

#### [MODIFY] task-list.component.ts
- Eliminar `console.error('Failed to fetch tasks:', errorResponse);`.

#### [MODIFY] project-list.component.ts
- Eliminar `console.error('Failed to load projects:', err);`.

#### [MODIFY] project-detail.component.ts
- Eliminar `console.error('Failed to load project dashboard details:', err);`.

#### [MODIFY] login.component.ts
- Eliminar `console.error('Login error:', error);`. *(Nota: encontrado por el sistema en una revisión adicional)*.

## Plan de Verificación

### Verificación Manual
- Ejecutar la aplicación en modo desarrollo (`ng serve`) y validar que el fallback del Mock Auth sigue funcionando en la ruta `/login`.
- Construir para producción (`ng build`) o modificar temporalmente el environment de desarrollo para probar que un error de red muestra el error correspondiente al usuario sin autenticarlo de forma falsa.
- Intentar agregar un comentario a un Tarea con el backend apagado para verificar que se muestra el mensaje de error local provisto por la señal `commentError` en lugar del alert nativo.
- Buscar nuevamente usos de `console.error` o `alert()` en todo el directorio `src/app` para confirmar su completa eliminación.
