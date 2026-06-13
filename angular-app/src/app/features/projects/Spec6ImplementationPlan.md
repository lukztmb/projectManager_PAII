# Plan de Implementación: Dashboard y Listado de Proyectos (SPEC 6)

Este plan detalla el diseño y la implementación de la pantalla principal de listado de proyectos (Dashboard), la integración del servicio de datos y los ajustes de enrutamiento en la aplicación Angular 21.

## User Review Required

> [!IMPORTANT]
> **Ajuste de URL Base de Proyectos:** Cambiaremos la URL de `ProjectService` de `http://localhost:8080/api/projects` a `http://localhost:3000/api/projects` para alinearse con `TaskService` y consumir correctamente el servidor mock en desarrollo (`json-server`).
>
> **Corrección del Enrutamiento del Proyecto:** 
> 1. Agregaremos la ruta `/projects` protegida por `authGuard` que renderizará el nuevo `ProjectListComponent`.
> 2. Redirigiremos el inicio de sesión exitoso de `/tasks/in-progress` a `/projects` de acuerdo con la descripción de la feature.
> 3. Registraremos la ruta `/projects/:projectId/tasks/in-progress` para resolver el redireccionamiento por defecto desde la raíz `/` de la aplicación y asociaremos `/projects/:projectId` para redirigir a este listado de tareas del proyecto.

---

## Proposed Changes

### 1. Data Access & Domain Model

#### [MODIFY] [project.model.ts](projectManager/angular-app/src/app/features/projects/models/project.model.ts)
- Adición de la interfaz `Project` que representa la entidad completa retornada por la API (con `id`).

#### [MODIFY] [project.service.ts](projectManager/angular-app/src/app/features/projects/data_access/project.service.ts)
- Actualización de `BASE_API_URL` a `'http://localhost:3000/api/projects'`.
- Implementación del método `getProjects(): Observable<Project[]>` para obtener la lista de proyectos mediante una petición GET.

---

### 2. UI Components

#### [NEW] [project-list.component.ts](projectManager/angular-app/src/app/features/projects/feature/project-list/project-list.component.ts)
- Creación del componente standalone `ProjectListComponent` para el Dashboard:
  - Definición de Signals de estado reactivo: `projects = signal<Project[]>([])`, `isLoading = signal<boolean>(true)`, `error = signal<string | null>(null)`.
  - Consumo del servicio en `ngOnInit()` para cargar los datos de la API.
  - Lógica para mapear el estado del proyecto (`ProjectStatus`) a clases de Tailwind CSS (Verde para `ACTIVE`, Gris/Slate para `CLOSED`, Azul/Indigo para `PLANNED`).
  - Maquetación responsiva con CSS Grid para las tarjetas de proyectos. Cada tarjeta mostrará el nombre, las fechas de inicio/fin formateadas y una etiqueta de estado.
  - Lógica de **Empty State** (Estado Vacío): Si la lista está vacía, mostrar un mensaje ilustrado y un botón destacado (Call to Action) para crear un proyecto (`/projects/create`).
  - Botón superior "Nuevo Proyecto" para navegar a `/projects/create`.
  - Navegación al hacer clic en las tarjetas de proyecto usando `[routerLink]="['/projects', project.id]"`.

---

### 3. Wiring & Routing Configuration

#### [MODIFY] [app.routes.ts](projectManager/angular-app/src/app/app.routes.ts)
- Registro de las siguientes rutas bajo la protección del `authGuard`:
  - `path: 'projects'`: Carga perezosa del `ProjectListComponent`.
  - `path: 'projects/:projectId'`: Redirige a `'projects/:projectId/tasks/in-progress'`.
  - `path: 'projects/:projectId/tasks/in-progress'`: Carga perezosa del `TaskListComponent`.
  - *Nota:* Esto asegura que el redireccionamiento raíz (`/` -> `projects/1/tasks/in-progress`) funcione correctamente y que la navegación a un proyecto específico (ej. `/projects/5`) cargue la vista de tareas de dicho proyecto.

#### [MODIFY] [login.component.ts](projectManager/angular-app/src/app/features/auth/feature/login/login.component.ts)
- Actualización de la redirección tras un login exitoso de `/tasks/in-progress` a `/projects`.

---

## Verification Plan

### Automated Tests
- Validar la compilación del proyecto con `npm run build` para asegurar la integridad de los tipos y módulos.

### Manual Verification
1. **Visualización de Grid (Happy Path):** Con la base de datos mock poblada, iniciar sesión y verificar que el usuario es redirigido a `/projects`, viendo una cuadrícula de tarjetas con nombre, fechas y insignias de colores según su estado (Criterio 1).
2. **Visualización de Empty State:** Limpiar la base de datos de proyectos (`db.json` con `"projects": []`), recargar `/projects` y verificar el estado vacío con el mensaje "No hay proyectos activos" y el botón para crear el primer proyecto (Criterio 2).
3. **Navegación Dinámica:** Hacer clic en la tarjeta de un proyecto (ej. ID 5) y verificar que la URL cambia a `/projects/5`, redireccionando a `/projects/5/tasks/in-progress` y mostrando las tareas asociadas (Criterio 3).
4. **Protección de Ruta:** Intentar ingresar a `/projects` sin estar autenticado y validar la redirección automática a `/login`.
