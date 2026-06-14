### SPEC 3: Creación de Tareas

| Campo | Descripción y criterio de calidad |
| --- | --- |
| **Nombre de la feature** | Creación de Tarea para un Proyecto (Create Task under Project) |
| **Descripción general** | Interfaz que permite registrar una nueva tarea asociada a un proyecto existente. Debe extraer el contexto del proyecto desde la ruta y asegurar que los datos ingresados cumplen con las estimaciones de tiempo y estados válidos. |
| **Endpoints involucrados** | - `POST /projects/{projectId}/tasks` |
| **Restricciones de negocio** | 1. **Campos obligatorios:** El título (`title`) es obligatorio.

  
2. **Validación de esfuerzo:** Las horas estimadas (`estimatedHours`) deben ser estrictamente mayores a cero (`> 0`).

  
3. **Estados permitidos:** El estado de la tarea (`status`) está limitado a `TODO`, `IN_PROGRESS` o `DONE`.

  
4. **Regla de Proyecto Cerrado:** No se puede agregar una tarea a un proyecto cuyo estado sea `CLOSED`. El backend devolverá un error `409 Conflict` si esto ocurre. |
| **Lineamientos técnicos** | - **Enrutamiento (Routing):** El componente debe extraer el `projectId` directamente de los parámetros de la ruta (ej. usando la signal `input()` con el Router de Angular 21, o inyectando `ActivatedRoute`).

  
- **Formularios:** **Reactive Forms**. Se deben utilizar validadores nativos como `Validators.required` y `Validators.min(1)`.

  
- **Componente:** Standalone component (`TaskCreateComponent`).

  
- **Manejo de Errores HTTP:** Interceptar el error `409 Conflict` (Business Rule Violation) para mostrar un mensaje claro al usuario indicando que el proyecto está cerrado o no permite nuevas tareas. |
| **Criterios de aceptación** | **Criterio 1 (Happy Path):**

  
**Dado** que el usuario ingresa un título válido, un estado correcto y horas estimadas mayores a 0,

  
**Cuando** envía el formulario,

  
**Entonces** se emite un `POST` al endpoint `/projects/{projectId}/tasks`, el sistema recibe un `201 Created` y redirige al listado de tareas del proyecto.

  
  
**Criterio 2 (Validación de horas estimadas):**

  
**Dado** que el usuario está completando el formulario,

  
**Cuando** ingresa el valor `0` o un número negativo en `estimatedHours`,

  
**Entonces** el campo se marca como inválido, se muestra un mensaje de error y el botón de enviar se deshabilita.

  
  
**Criterio 3 (Regla de Proyecto Cerrado - 409):**

  
**Dado** que el formulario es válido pero el proyecto padre está en estado `CLOSED`,

  
**Cuando** se envía la petición HTTP,

  
**Entonces** el backend responde con un error 409 y la UI captura el error mostrando una alerta: "No se puede añadir una tarea a un proyecto cerrado".

  
  
**Criterio 4 (Proyecto no encontrado - 404):**

  
**Dado** que el formulario es válido y el usuario intenta crear una tarea,

  
**Cuando** el `projectId` en la URL ya no existe en la base de datos (fue eliminado),

  
**Entonces** el backend responde con `404 Not Found` y la UI muestra un mensaje informativo: "El proyecto no fue encontrado. Pudo haber sido eliminado."

  
  
**Criterio 5 (Flujo de cancelación):**

  
**Dado** que el usuario está completando el formulario de creación de tarea,

  
**Cuando** presiona el botón "Cancelar",

  
**Entonces** el sistema navega de vuelta al detalle del proyecto padre (`/projects/:projectId`) sin enviar ninguna petición al backend. |

