
### SPEC 1: listTasks

| Campo | Descripción y criterio de calidad |
| --- | --- |
| **Nombre de la feature** | Visualización de Tareas en Progreso (In-Progress Task List) |
| **Descripción general** | El sistema debe permitir al usuario visualizar un listado de todas las tareas que actualmente se encuentran en curso. Esto establece la base de comunicación de lectura (GET) con la API REST y la estructura inicial de componentes. |
| **Endpoints involucrados** | - `GET /tasks?status=IN_PROGRESS` |
| **Restricciones de negocio** | 1. Solo se deben renderizar en la vista las tareas obtenidas del endpoint (las cuales deben estar lógicamente en estado `IN_PROGRESS`).

  
2. Si la API devuelve un listado vacío, el sistema no debe fallar; debe mostrar un mensaje amigable al usuario (ej. "No hay tareas en progreso").

  
3. Se debe manejar visualmente el estado de "Carga" (Loading) mientras se espera la respuesta del servidor.

  
4. Las tareas sin un `assignee` definido deben mostrar el texto "Unassigned" o "Sin asignar". |
| **Lineamientos técnicos** | - **Framework**: Angular 21 con uso estricto de **Standalone Components**.

  
- **Estructura**: El componente residirá en una arquitectura basada en features, ej: `src/app/features/tasks/task-list/`.

  
- **Estado y Reactividad**: Se utilizarán **Angular Signals** para manejar el estado local del componente (datos, estado de carga, errores) en lugar de suscribirse directamente a los observables en la vista.

  
- **Estilos**: Tailwind CSS para el diseño responsivo y maquetación.

  
- **Servicios**: Un `TaskService` inyectable que utilice `HttpClient` para la llamada HTTP. |
| **Criterios de aceptación** | **Criterio 1 (Happy Path):**

  
**Dado** que el usuario accede a la vista de tareas,

  
**Cuando** la petición `GET /tasks?status=IN_PROGRESS` responde exitosamente con un arreglo de tareas,

  
**Entonces** la pantalla renderiza una lista de tarjetas/filas mostrando al menos el `title`, `estimateHours` y `assignee` de cada tarea.

  
  
**Criterio 2 (Lista vacía):**

  
**Dado** que el usuario accede a la vista de tareas,

  
**Cuando** la petición responde con un arreglo vacío `[]`,

  
**Entonces** la pantalla muestra el mensaje "No hay tareas en progreso actualmente".

  
  
**Criterio 3 (Manejo de Errores):**

  
**Dado** que el backend no está disponible o devuelve un error 500/404,

  
**Cuando** el `TaskService` falla al obtener los datos,

  
**Entonces** la UI captura el error mediante Signals y muestra un mensaje indicando que hubo un problema de comunicación. |
