# SPECFixes2: Correcciones de UX, Navegación y Consistencia Visual

> **Origen:** Code Reviews #2, #3, #4, #7, #8 — Hallazgos de flujo de usuario, idioma de interfaz y navegación.
> **Prioridad:** Media — Mejoran la experiencia de usuario y la coherencia del producto.

---

| Campo | Descripción y criterio de calidad |
| --- | --- |
| **Nombre de la feature** | Correcciones de UX, Navegación y Consistencia de Idioma (UX, Navigation & Language Consistency Fixes) |
| **Descripción general** | Conjunto de correcciones derivadas de las revisiones de código que abordan: **(a)** la falta de redirección tras crear un proyecto exitosamente, **(b)** la navegación del logout que no reemplaza el historial del navegador (`replaceUrl: true`), **(c)** la ruta de destino del botón "Cancel" en creación de tarea que apunta a una ruta inexistente, **(d)** la inconsistencia del idioma en la UI y **(e)** el manejo de error genérico en la carga concurrente del detalle de proyecto. |

---

### Fix 2a: Redirección post-éxito en Creación de Proyecto

**Origen:** Code Review #2 — `ProjectCreateComponent`

**Estado actual verificado en `project-create.component.ts`:**
```typescript
next: () => {
  this.isSubmitting.set(false);
  this.successMessage.set('Project created successfully!');
  this.projectForm.reset({ status: ProjectStatus.PLANNED });
}
```

El happy path de la SPEC 2 dice: *"recibe un 201 Created y muestra un mensaje de éxito **(o redirige al listado)**"*. El código actual muestra el mensaje pero **no redirige**. Para completar el flujo de UX, se debe agregar una redirección temporizada al listado de proyectos después de mostrar el mensaje de éxito.

**Restricciones de negocio:**
1. Tras recibir un `201 Created`, el sistema debe mostrar brevemente el mensaje de éxito y luego redirigir a `/projects` tras un breve delay (aprox. 1.5 segundos) para que el usuario pueda leer la confirmación.
2. Si se prefiere una redirección inmediata (sin delay), se omite el mensaje y se navega directamente.

**Lineamientos técnicos:**
- Inyectar `Router` en `ProjectCreateComponent`.
- En el bloque `next`, tras setear el mensaje de éxito, usar `setTimeout` para redirigir:
  ```typescript
  next: () => {
    this.isSubmitting.set(false);
    this.successMessage.set('¡Proyecto creado exitosamente! Redirigiendo...');
    setTimeout(() => {
      this.router.navigate(['/projects']);
    }, 1500);
  }
  ```

**Criterios de aceptación:**

**Criterio 1 (Redirección post-éxito):**

**Dado** que el usuario llena correctamente el formulario de creación de proyecto,

**Cuando** el backend responde con `201 Created`,

**Entonces** la UI muestra el mensaje de confirmación y automáticamente navega al listado de proyectos (`/projects`) sin intervención del usuario.

---

### Fix 2b: Logout con `replaceUrl: true`

**Origen:** Code Review #8 — `AuthService.logout()`

**Estado actual verificado en `auth.service.ts` línea 78:**
```typescript
public logout(): void {
  this.clearSession();
  this.router.navigate(['/login']);
}
```

La SPEC 8 (Criterio 2) establece que al cerrar sesión, el usuario **no debe poder usar el botón "Atrás" del navegador para volver a ver datos sensibles**. El código actual no cumple esta restricción porque `router.navigate` agrega una nueva entrada al historial del navegador.

**Restricciones de negocio:**
1. Tras ejecutar el logout, la entrada de historial actual debe ser **reemplazada** (no apilada), impidiendo que el botón "Atrás" regrese a la última vista protegida.

**Lineamientos técnicos:**
- Modificar la llamada de navegación en `AuthService.logout()`:
  ```typescript
  public logout(): void {
    this.clearSession();
    this.router.navigate(['/login'], { replaceUrl: true });
  }
  ```

**Criterios de aceptación:**

**Criterio 1 (Historial limpio post-logout):**

**Dado** que el usuario se encuentra autenticado navegando en `/projects`,

**Cuando** hace clic en "Cerrar Sesión",

**Entonces** es redirigido a `/login` y al presionar el botón "Atrás" del navegador, **no** regresa a `/projects` ni a ninguna otra vista protegida.

---

### Fix 2c: Ruta de destino del botón "Cancel" en Creación de Tarea

**Origen:** Code Review #3 — `TaskCreateComponent.navigateBack()`

**Estado actual verificado en `task-create.component.ts` línea 143:**
```typescript
public navigateBack(): void {
  this.router.navigate(['/projects', this.projectId(), 'tasks']);
}
```

La ruta `/projects/:projectId/tasks` **no existe** en el `app.routes.ts`. Las rutas definidas son:
- `projects/:projectId` → `ProjectDetailComponent`
- `projects/:projectId/tasks/in-progress` → `TaskListComponent`
- `projects/:projectId/tasks/create` → `TaskCreateComponent`
- `projects/:projectId/tasks/:taskId` → `TaskDetailComponent`

Esto provocaría un redirect a la ruta wildcard `**` (que lleva a `/projects`), lo cual no es la intención. El destino lógico del "Cancel" es la vista del proyecto padre.

**Restricciones de negocio:**
1. El botón "Cancel" debe navegar al usuario de vuelta al detalle del proyecto padre (`/projects/:projectId`), donde puede ver el listado de tareas.
2. La SPEC 3 no especifica formalmente el flujo de cancelación, pero el Code Review #3 identificó que el documento debería describirlo. Este fix formaliza el comportamiento.

**Lineamientos técnicos:**
- Corregir la ruta en `navigateBack()`:
  ```typescript
  public navigateBack(): void {
    this.router.navigate(['/projects', this.projectId()]);
  }
  ```

**Criterios de aceptación:**

**Criterio 1 (Navegación de cancelación correcta):**

**Dado** que el usuario está en el formulario de creación de tarea,

**Cuando** presiona el botón "Cancel",

**Entonces** el router navega a `/projects/:projectId` (el detalle del proyecto padre) y la vista se renderiza correctamente.

---

### Fix 2d: Consistencia de idioma en la interfaz

**Origen:** Code Reviews #2, #3, #4 — Inconsistencia recurrente de idioma

**Estado actual verificado:**
La interfaz mezcla textos en inglés y español de forma inconsistente:

| Componente | Textos en inglés detectados |
| --- | --- |
| `project-create.component.ts` | "Create New Project", "Fill in the details...", "Project Name *", "End date cannot be in the past.", "Project created successfully!", "Create Project", "Saving..." |
| `task-create.component.ts` | "Create New Task", "Task Title *", "Estimate (Hours) *", "e.g., Create landing page", "Cancel", "Create Task", "Saving...", "Title is required.", "Estimate must be greater than 0.", mensajes de error 409/404 en inglés |
| `task-detail.component.ts` | "Access Denied", "Task #...", "Comments", "No comments yet. Be the first to comment!", "Assignee:", "Estimate:", "Adding comment..." |
| `task-list.component.ts` | (En español ✅) "Tareas en Progreso", "Cargando tareas..." |
| `project-list.component.ts` | (En español ✅) "Proyectos", "No hay proyectos activos" |
| `project-detail.component.ts` | (Mayormente en español ✅) "Volver a Proyectos", "Nueva Tarea", "Tareas del Proyecto" |

Los componentes del PR #6, #7 y #8 mantienen el español. Los componentes de PRs #2, #3 y #4 usan inglés.

**Restricciones de negocio:**
1. **Idioma de la UI: Español.** Dado que las SPECs, los Code Reviews y la mayor parte del layout están en español, la interfaz de usuario debe ser consistente en español.
2. **Código en inglés.** Variables, clases, métodos, comentarios y documentación técnica (JSDoc/Javadoc) se mantienen estrictamente en inglés, según la regla del proyecto.
3. Los textos que son valores de Enum (`ACTIVE`, `IN_PROGRESS`, `TODO`, etc.) pueden mantenerse en inglés ya que son identificadores técnicos.

**Lineamientos técnicos:**
- Reemplazar los textos de UI hardcodeados en los templates de:
  - `ProjectCreateComponent`
  - `TaskCreateComponent`
  - `TaskDetailComponent`

**Tabla de traducciones requeridas:**

| Texto actual (inglés) | Traducción requerida (español) |
| --- | --- |
| "Create New Project" | "Crear Nuevo Proyecto" |
| "Fill in the details to start a new project." | "Completa los datos para iniciar un nuevo proyecto." |
| "Project Name *" | "Nombre del Proyecto *" |
| "Start Date *" | "Fecha de Inicio *" |
| "End Date *" | "Fecha de Fin *" |
| "Initial Status *" | "Estado Inicial *" |
| "Description (Optional)" | "Descripción (Opcional)" |
| "End date cannot be in the past." | "La fecha de fin no puede ser anterior a hoy." |
| "End date must be greater than or equal to the start date." | "La fecha de fin debe ser mayor o igual a la fecha de inicio." |
| "Name is required." | "El nombre es obligatorio." |
| "Project created successfully!" | "¡Proyecto creado exitosamente!" |
| "Create Project" | "Crear Proyecto" |
| "Saving..." | "Guardando..." |
| "Create New Task" | "Crear Nueva Tarea" |
| "Task Title *" | "Título de la Tarea *" |
| "Estimate (Hours) *" | "Estimación (Horas) *" |
| "Title is required." | "El título es obligatorio." |
| "Estimate must be greater than 0." | "La estimación debe ser mayor a 0." |
| "Assignee (Optional)" | "Responsable (Opcional)" |
| "Cancel" | "Cancelar" |
| "Create Task" | "Crear Tarea" |
| "Access Denied" | "Acceso Denegado" |
| "Task #" | "Tarea #" |
| "Comments" | "Comentarios" |
| "No comments yet. Be the first to comment!" | "Aún no hay comentarios. ¡Sé el primero en comentar!" |
| "Assignee:" | "Responsable:" |
| "Estimate:" | "Estimación:" |
| "Unassigned" | "Sin asignar" |
| "Adding comment..." | "Agregando comentario..." |
| Mensajes de error HTTP en inglés | Traducir a español consistente |

**Criterios de aceptación:**

**Criterio 1 (Idioma unificado):**

**Dado** que se realiza una revisión visual de todas las vistas de la aplicación (login excluido si se decide mantenerlo bilingüe),

**Cuando** el evaluador navega por la lista de proyectos, creación de proyecto, detalle de proyecto, creación de tarea y detalle de tarea,

**Entonces** todas las etiquetas, mensajes de validación, mensajes de éxito y mensajes de error están redactados en español.

---

### Fix 2e: Manejo de error granular en `forkJoin` de Detalle de Proyecto

**Origen:** Code Review #7 — `ProjectDetailComponent`

**Estado actual verificado en `project-detail.component.ts`:**
```typescript
forkJoin({
  project: this.projectService.getProjectById(id),
  tasks: this.projectService.getProjectTasks(id)
}).subscribe({
  // ...
  error: (err: any) => {
    console.error('Failed to load project dashboard details:', err);
    this.error.set('No se pudo establecer conexión...');
    this.isLoading.set(false);
  }
});
```

Si falla solo una de las dos peticiones (por ejemplo, el endpoint de tareas falla pero el de proyecto responde bien), `forkJoin` completo falla y se muestra un error genérico. No se aprovecha la respuesta parcial exitosa.

**Restricciones de negocio:**
1. Si la petición del proyecto falla, se muestra el error genérico (no hay contexto para renderizar la vista).
2. Si solo falla la petición de tareas, se deben mostrar los datos del proyecto y un mensaje de error localizado **solo** en la sección de tareas, indicando que no se pudieron cargar.

**Lineamientos técnicos (concepto, no desarrollado en código):**
- Usar `catchError` individual en cada observable antes del `forkJoin`:
  ```typescript
  forkJoin({
    project: this.projectService.getProjectById(id),
    tasks: this.projectService.getProjectTasks(id).pipe(
      catchError(() => of([]))  // Graceful degradation: lista vacía + flag de error
    )
  })
  ```
- Introducir una Signal `taskLoadError` para mostrar un aviso parcial en la sección de tareas.

> **Nota:** Este fix es una mejora de resiliencia. El comportamiento actual (error global) es funcionalmente aceptable pero no óptimo para la UX.

**Criterios de aceptación:**

**Criterio 1 (Degradación elegante):**

**Dado** que la petición `GET /projects/{id}` responde exitosamente pero `GET /projects/{id}/tasks` falla con error 500,

**Cuando** la vista de detalle de proyecto se carga,

**Entonces** la cabecera del proyecto se renderiza correctamente y la sección de tareas muestra un mensaje de error indicando que no se pudieron cargar las tareas, sin bloquear toda la vista.

