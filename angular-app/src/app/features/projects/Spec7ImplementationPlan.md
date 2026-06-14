# Plan de Implementación: Detalle de Proyecto y Listado de Tareas (SPEC 7)

Este plan describe la arquitectura y pasos para implementar la pantalla de detalle de proyecto y listado de tareas asociadas, optimizando las peticiones de red y asegurando una interfaz defensiva conforme a `SPEC7.md`.

## User Review Required

> [!IMPORTANT]
> **Defensive UI (Interfaz Defensiva):** Si el estado del proyecto es `CLOSED`, el botón para "Nueva Tarea" se ocultará o deshabilitará visualmente. Esto previene que el usuario intente realizar una acción que el servidor rechazará con un error de conflicto.
>
> **Carga Concurrente con forkJoin:** Para evitar el antipatrón de peticiones en cascada (*Waterfall*), utilizaremos `forkJoin` de RxJS en la inicialización del componente para disparar en paralelo los endpoints `GET /projects/{projectId}` y `GET /projects/{projectId}/tasks`.
>
> **Enrutamiento Simplificado:** Reemplazaremos la redirección temporal de la ruta `projects/:projectId` por la carga directa del nuevo `ProjectDetailComponent`.

---

## Proposed Changes

### 1. Data Access (API Integration)

#### [MODIFY] [project.service.ts](projectManager/angular-app/src/app/features/projects/data_access/project.service.ts)
- Adición de dos nuevos métodos integrados con la URL base del servidor mock (puerto 3000):
  - `getProjectById(id: string | number): Observable<Project>`
  - `getProjectTasks(projectId: string | number): Observable<Task[]>`
- Importación de la interfaz `Task` de tareas.

---

### 2. UI Components & Reusability

#### [MODIFY] [task-card.component.ts](projectManager/angular-app/src/app/features/tasks/ui/task-card/task-card.component.ts)
- Extensión del componente reusable `TaskCardComponent`:
  - Adición de una entrada de señal opcional `detailsUrl = input<any[] | string | null>(null)` para recibir la ruta de navegación.
  - Registro de `RouterLink` en los imports del componente.
  - Modificación de la plantilla para renderizar un botón elegante de "Ver detalle" alineado a la derecha si `detailsUrl` está definido.

#### [NEW] [project-detail.component.ts](projectManager/angular-app/src/app/features/projects/feature/project-detail/project-detail.component.ts)
- Creación del componente standalone `ProjectDetailComponent` para el panel de control del proyecto:
  - Uso de **Router Input Signals** (`projectId = input.required<string>()`) para capturar el parámetro de la URL.
  - Gestión de estado reactivo mediante Signals locales: `project = signal<Project | null>(null)`, `tasks = signal<Task[]>([])`, `isLoading = signal<boolean>(true)`, `error = signal<string | null>(null)`.
  - Inyección de `ProjectService` y orquestación paralela con `forkJoin` dentro de un bloque reactivo al ID del proyecto.
  - **Header de Proyecto:** Diseño moderno en Tailwind CSS para mostrar el nombre, fechas del proyecto (formateadas con `DatePipe`) y el badge correspondiente a su estado actual.
  - **Control del Botón "Nueva Tarea" (Criterio 2):** Renderizar condicionalmente el botón de creación solo si el estado del proyecto no es `CLOSED`.
  - **Body de Tareas (Criterio 1 y 3):** Renderizar una grilla con los `TaskCardComponent` correspondientes, pasando `[detailsUrl]="['tasks', task.id]"` para el enlace dinámico.
  - **Empty State de Tareas:** Si la lista de tareas está vacía, renderizar un mensaje claro: "Este proyecto aún no tiene tareas asignadas".

---

### 3. Routing Configuration

#### [MODIFY] [app.routes.ts](projectManager/angular-app/src/app/app.routes.ts)
- Actualización de la ruta `projects/:projectId` en `app.routes.ts` para que cargue perezosamente el nuevo `ProjectDetailComponent` bajo `authGuard`.

---

## Verification Plan

### Automated Tests
- Compilación del proyecto completo mediante `npm run build` para asegurar la ausencia de fallos sintácticos o de tipado.

### Manual Verification
1. **Renderizado de Cabecera y Tareas (Criterio 1):** Iniciar sesión, ir al Dashboard y hacer clic en un proyecto activo (ej: ID 1). Verificar que el componente muestra correctamente la información en la cabecera (Nombre, Fechas, Estado) y que lista todas sus tareas asociadas debajo.
2. **Defensive UI - Proyecto Cerrado (Criterio 2):** Modificar el estado de un proyecto en `db.json` a `CLOSED`. Acceder a dicho proyecto en el navegador y verificar que el botón "Nueva Tarea" está oculto/deshabilitado.
3. **Empty State de Tareas:** Crear un nuevo proyecto o borrar todas las tareas de uno existente en `db.json`. Entrar a su detalle y verificar que se muestra el mensaje de estado vacío "Este proyecto aún no tiene tareas asignadas".
4. **Navegación al Detalle de Tarea (Criterio 3):** En la grilla de tareas del proyecto con ID 1, hacer clic en el botón "Ver detalle" de la tarea con ID 5. Validar que la URL del navegador cambie a `/projects/1/tasks/5`.
