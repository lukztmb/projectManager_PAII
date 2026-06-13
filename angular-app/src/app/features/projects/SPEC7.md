### SPEC 7: Detalle de Proyecto y Listado de Tareas

| Campo | Descripción y criterio de calidad |
| --- | --- |
| **Nombre de la feature** | Detalle de Proyecto y Gestión de Tareas (Project Detail & Tasks List) |
| **Descripción general** | Interfaz que actúa como panel de control para un proyecto específico. Obtiene de forma concurrente los detalles del proyecto y el listado de tareas asociadas. Centraliza la navegación hacia la creación de nuevas tareas y el detalle interactivo de las mismas. |
| **Endpoints involucrados** | - `GET /projects/{projectId}` (Detalle del proyecto)

  
- `GET /projects/{projectId}/tasks` (Listado de tareas del proyecto) |
| **Restricciones de negocio** | 1. **Jerarquía estricta:** La vista debe extraer el `projectId` de la URL y utilizarlo para ambas peticiones HTTP.

  
2. **Regla de Proyecto Cerrado (Defensive UI):** Si el estado del proyecto retornado es `CLOSED`, la UI debe ocultar o deshabilitar visualmente el botón de "Crear Nueva Tarea". (El backend ya previene esto con un 409, pero el frontend no debe inducir al error).

  
3. **Empty State de Tareas:** Si el proyecto no tiene tareas (`[]`), mostrar un mensaje como "Este proyecto aún no tiene tareas asignadas" para orientar al usuario. |
| **Lineamientos técnicos** | - **Carga Concurrente (RxJS + Signals):** Utilizar `forkJoin` en el servicio para disparar ambas peticiones `GET` en paralelo y evitar cuellos de botella ("waterfall requests"), o manejar dos *Signals* separadas (`projectDetails()` y `projectTasks()`) que reaccionen al cambio del ID de la ruta.

  
- **Enrutamiento (Routing):** Uso de *Router Input Signals* (`projectId = input<string>()`) para evitar inyectar el `ActivatedRoute`.

  
- **Maquetación (Tailwind):** Dividir la pantalla en un *Header* (con los datos y badges del proyecto) y un *Body* (con una grilla o lista de `TaskCardComponent`s). |
| **Criterios de aceptación** | **Criterio 1 (Carga exitosa y renderizado):**

  
**Dado** que el usuario navega a `/projects/1`,

  
**Cuando** se resuelven las peticiones de red,

  
**Entonces** la cabecera muestra el nombre y fechas del proyecto 1, y debajo se lista la cuadrícula con sus tareas asociadas.

  
  
**Criterio 2 (Defensa UI - Proyecto Cerrado):**

  
**Dado** que el usuario ingresa a un proyecto con status `CLOSED`,

  
**Cuando** la vista termina de cargar,

  
**Entonces** el botón de "Añadir Tarea" se encuentra deshabilitado (o no se renderiza) impidiendo la acción antes de que falle en el servidor.

  
  
**Criterio 3 (Navegación de Tareas):**

  
**Dado** que el usuario visualiza el listado de tareas del proyecto,

  
**Cuando** hace clic en el botón de ver detalle de la tarea ID 5,

  
**Entonces** el Router lo navega hacia la ruta `/projects/1/tasks/5`. |
