### SPEC - Backend Refactor 1: Enrutamiento y Contexto Delimitado

| Campo | Descripción y criterio de calidad |
| --- | --- |
| **Nombre de la feature** | Refactorización de Enrutamiento, CORS y Validación de Jerarquía (Bounded Context) |
| **Descripción general** | Estandarizar las definiciones de rutas en la capa de infraestructura (API) para reducir la duplicación de código. Implementar validación cruzada de entidades (Cross-Entity Validation) en los casos de uso para garantizar que una Tarea pertenece efectivamente al Proyecto referenciado en la URL. Finalmente, preparar la configuración CORS para soportar el envío de tokens JWT. |
| **Endpoints involucrados** | - `ProjectController.java` completo (reestructuración de paths).

  
- `GET /projects/{projectId}/tasks/{taskId}`

  
- `POST /projects/{projectId}/tasks/{taskId}/comments` |
| **Restricciones de negocio** | 1. **Jerarquía Delimitada:** Una `Task` solo puede ser leída o comentada si su identificador está lógicamente vinculado al `projectId` indicado en la ruta de la API.

  
2. **Rechazo Explícito:** Si un cliente intenta acceder a una `taskId` válida pero utilizando un `projectId` incorrecto en la URL, el sistema debe abortar la transacción inmediatamente, previniendo escalada de privilegios o manipulación de datos cruzados. |
| **Lineamientos técnicos** | - **Capa de API (`ProjectController.java`):** Extraer la ruta base agregando la anotación `@RequestMapping("/projects")` a nivel de clase. Limpiar las anotaciones `@GetMapping` y `@PostMapping` de los métodos para que hereden esta ruta base.

  
- **Capa de Aplicación (Use Cases):** Modificar las firmas de los métodos en `GetTaskByIdUseCase.java` y `AddCommentToTaskUseCase.java` (y sus DTOs de entrada si aplica) para que reciban el `Long projectId` como parámetro obligatorio.

  
- **Reglas de Negocio:** Dentro de la ejecución del Use Case, una vez recuperada la entidad `Task`, validar que `task.getProject().getId().equals(projectId)`. Si no es así, lanzar `BusinessRuleViolationsException` o `ResourceNotFoundException`.

  
- **Capa de Infraestructura (`CorsConfig.java`):** Modificar la configuración existente para añadir el encabezado `Authorization` a los `allowedHeaders` y `exposedHeaders`, permitiendo que el interceptor de Angular funcione en la próxima fase. |
| **Criterios de aceptación** | **Criterio 1 (Refactorización DRY):**

  
**Dado** el controlador `ProjectController`,

  
**Cuando** se inspecciona el código o se compila la aplicación,

  
**Entonces** las rutas utilizan `@RequestMapping("/projects")` a nivel de clase y los métodos no repiten el prefijo `/projects` en sus definiciones.

  
  
**Criterio 2 (Validación de Jerarquía):**

  
**Dado** que en la base de datos la Tarea ID 5 pertenece al Proyecto ID 1,

  
**Cuando** un cliente HTTP hace un `GET /projects/2/tasks/5` (notar el ID 2 incorrecto),

  
**Entonces** el Use Case aborta la operación y el `GlobalExceptionsHandler` devuelve un error HTTP 404 Not Found o 400 Bad Request indicando la discrepancia jerárquica.

  
  
**Criterio 3 (Preparación de Seguridad CORS):**

  
**Dado** que el frontend de Angular envía una petición *Preflight* (OPTIONS) hacia cualquier endpoint,

  
**Cuando** el backend de Spring Boot responde,

  
**Entonces** la cabecera `Access-Control-Allow-Headers` de la respuesta incluye el valor `Authorization`. |
