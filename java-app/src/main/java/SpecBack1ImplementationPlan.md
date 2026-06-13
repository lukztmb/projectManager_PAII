# Refactorización de Enrutamiento, CORS y Validación de Jerarquía

Este cambio estandariza las rutas en `ProjectController` usando una ruta base a nivel de clase, configura CORS para exponer y permitir el encabezado `Authorization`, y añade validación de jerarquía de entidades (Cross-Entity Validation) en los casos de uso de obtención de tareas y adición de comentarios para asegurar que la tarea pertenece al proyecto indicado en la URL.

## User Review Required

> [!IMPORTANT]
> - El endpoint para listar tareas por estado (`GET /tasks`) pasará a ser `GET /projects/tasks` debido a la anotación `@RequestMapping("/projects")` a nivel de clase. Esto coincide con los comentarios del código original, pero requiere actualizar las llamadas en los tests de integración correspondientes.

## Open Questions

> [!NOTE]
> - **Nombre del método en el Dominio**: La entidad `Task` tiene un método getter llamado `getProyect()` (con 'y'). Aunque lo ideal sería refactorizarlo a `getProject()` para corregir el error tipográfico, de momento lo utilizaremos tal cual está definido para no introducir cambios no solicitados en otras partes del dominio. ¿Desea que realicemos una refactorización de este nombre en el futuro?

## Proposed Changes

---

### Módulo de Dominio y Casos de Uso (Application Layer)

Modificaremos las firmas de los casos de uso y agregaremos la validación de jerarquía requerida.

#### [MODIFY] [GetTaskByIdUseCase.java](projectManager/java-app/src/main/java/application/usecase/GetTaskByIdUseCase.java)
- Cambiar la firma del método `execute` para recibir `Long projectId` como primer parámetro.
- Añadir la validación `if (task.getProyect() == null || !task.getProyect().getId().equals(projectId))` y lanzar `ResourceNotFoundException` si no coinciden.

#### [MODIFY] [AddCommentToTaskUseCase.java](projectManager/java-app/src/main/java/application/usecase/AddCommentToTaskUseCase.java)
- Cambiar la firma del método `execute` para recibir `Long projectId` como segundo parámetro (después del DTO).
- Añadir la misma validación de jerarquía y lanzar `ResourceNotFoundException` si hay discrepancia.

---

### Módulo de Infraestructura (Infrastructure & API Layer)

Configuraremos CORS y simplificaremos las rutas del controlador.

#### [MODIFY] [CorsConfig.java](projectManager/java-app/src/main/java/infrastructure/config/CorsConfig.java)
- Añadir `.allowedHeaders("Authorization", "*")` y `.exposedHeaders("Authorization")` para permitir el interceptor JWT de Angular.

#### [MODIFY] [ProjectController.java](projectManager/java-app/src/main/java/infrastructure/controller/ProjectController.java)
- Añadir `@RequestMapping("/projects")` a nivel de clase.
- Modificar las anotaciones `@PostMapping` y `@GetMapping` para remover el prefijo duplicado `/projects`.
- Adaptar las llamadas a los casos de uso para pasar el parámetro `projectId` obtenido de la URL.

---

### Módulo de Pruebas (Tests)

Actualizaremos los tests unitarios y de integración para adaptarlos a las nuevas firmas y rutas, y añadiremos cobertura para los nuevos flujos de error.

#### [MODIFY] [GetTaskByIdTest.java](projectManager/java-app/src/test/java/application/usecase/GetTaskByIdTest.java)
- Mockear `Project` con ID `1L` en `mockTask.getProyect()`.
- Adaptar las llamadas a `execute` pasando el `projectId`.
- Agregar un test para verificar que lanza `ResourceNotFoundException` en caso de discrepancia de proyecto.

#### [MODIFY] [AddCommentToTaskTest.java](projectManager/java-app/src/test/java/application/usecase/AddCommentToTaskTest.java)
- Mockear `Project` con ID `1L` en `mockTaskFound.getProyect()`.
- Adaptar las llamadas a `execute` pasando el `projectId`.
- Agregar un test para verificar que lanza `ResourceNotFoundException` en caso de discrepancia de proyecto.

#### [MODIFY] [AddCommentToTaskPersistenceIntegrationTest.java](projectManager/java-app/src/test/java/persistence/AddCommentToTaskPersistenceIntegrationTest.java)
- Realizar las mismas adaptaciones de firmas y mocks que en `AddCommentToTaskTest.java`.
- Agregar un test para discrepancia de proyecto.

#### [MODIFY] [ProjectControllerIntegrationTest.java](projectManager/java-app/src/test/java/infrastructure/controller/ProjectControllerIntegrationTest.java)
- Actualizar las peticiones de `/tasks` a `/projects/tasks`.
- Agregar tests de integración para comprobar que `GET /projects/2/tasks/5` (con ID de proyecto incorrecto) devuelve un `404 Not Found` en lugar de la tarea.
- Agregar un test de integración para comprobar que `POST /projects/2/tasks/5/comments` devuelve un `404 Not Found` en lugar de permitir añadir el comentario.

## Verification Plan

### Automated Tests
- Ejecutar `./mvnw clean test` en el directorio `java-app` para asegurar la compilación limpia y la superación de todos los tests de integración y unitarios.

### Manual Verification
- Comprobar que los endpoints de consulta de tareas e inserción de comentarios validen correctamente el `projectId` simulando peticiones HTTP con IDs cruzados y observando el código de respuesta HTTP `404 Not Found`.
