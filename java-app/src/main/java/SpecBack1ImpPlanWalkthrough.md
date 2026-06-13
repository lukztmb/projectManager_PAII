# Walkthrough - Refactorización de Enrutamiento, CORS y Validación de Jerarquía

Se han implementado con éxito todas las especificaciones detalladas en el contrato del backend. A continuación se resume el trabajo realizado y sus resultados.

## Cambios Realizados

### Capa de Aplicación (Use Cases)
- **[GetTaskByIdUseCase.java](projectManager/java-app/src/main/java/application/usecase/GetTaskByIdUseCase.java)**:
  - Firma del método modificada para recibir el parámetro `Long projectId`.
  - Añadida validación cruzada: si la tarea recuperada no pertenece al proyecto proporcionado, se lanza `ResourceNotFoundException`.
- **[AddCommentToTaskUseCase.java](projectManager/java-app/src/main/java/application/usecase/AddCommentToTaskUseCase.java)**:
  - Firma del método modificada para recibir el parámetro `Long projectId`.
  - Añadida idéntica validación cruzada para asegurar la jerarquía y evitar comentarios maliciosos cruzados.

### Capa de Infraestructura (API & Config)
- **[CorsConfig.java](projectManager/java-app/src/main/java/infrastructure/config/CorsConfig.java)**:
  - Modificado para incluir el encabezado `Authorization` tanto en las cabeceras permitidas (`allowedHeaders`) como expuestas (`exposedHeaders`).
- **[ProjectController.java](projectManager/java-app/src/main/java/infrastructure/controller/ProjectController.java)**:
  - Agregada anotación `@RequestMapping("/projects")` a nivel de clase.
  - Simplificados los mapeos de métodos (`@PostMapping`, `@PostMapping("/{projectId}/tasks")`, etc.) heredando la ruta base.
  - Adaptados los métodos que consumen los casos de uso para pasar el parámetro `projectId` de la URL.

### Recursos de Pruebas (Test Context)
- **[application.properties (test)](projectManager/java-app/src/test/resources/application.properties)**:
  - Creado archivo de propiedades específico para pruebas que levanta una base de datos **H2 en memoria** con modo de compatibilidad PostgreSQL. Esto permite ejecutar la suite completa de tests de manera rápida y sin depender de contenedores Docker o de base de datos externa.

### Suite de Pruebas (Tests)
- **[GetTaskByIdTest.java](projectManager/java-app/src/test/java/application/usecase/GetTaskByIdTest.java)**:
  - Adaptados los mocks y llamadas de prueba al caso de uso.
  - Añadido test unitario para verificar que se lanza la excepción en caso de discrepancia de proyecto.
  - Configurado Mockito con `lenient()` para evitar advertencias de stubbing innecesario en la inicialización del mock de `Task`.
- **[AddCommentToTaskTest.java](projectManager/java-app/src/test/java/application/usecase/AddCommentToTaskTest.java)** y **[AddCommentToTaskPersistenceIntegrationTest.java](projectManager/java-app/src/test/java/persistence/AddCommentToTaskPersistenceIntegrationTest.java)**:
  - Adaptadas llamadas y mocks en tests existentes.
  - Añadidos tests unitarios correspondientes para validación de discrepancias.
- **[ProjectControllerIntegrationTest.java](projectManager/java-app/src/test/java/infrastructure/controller/ProjectControllerIntegrationTest.java)**:
  - Rutas actualizadas de `/tasks` a `/projects/tasks`.
  - Añadidos tests de integración robustos para comprobar que el controlador intercepta y devuelve un código HTTP `404 Not Found` en caso de discrepancia jerárquica para:
    - Búsqueda de tareas por ID (`GET /projects/{wrongProjectId}/tasks/{taskId}`)
    - Creación de comentarios en tareas (`POST /projects/{wrongProjectId}/tasks/{taskId}/comments`)

---

## Pruebas y Resultados de Validación

### Pruebas Automatizadas
Se ejecutó el comando de ciclo de vida de Maven completo:
```powershell
.\mvnw clean test
```
Resultados obtenidos:
- **Pruebas Totales Ejecutadas**: 62
- **Fallos**: 0
- **Errores**: 0
- **Skipped**: 0
- **Resultado Final**: `BUILD SUCCESS` (Compilación limpia y pruebas exitosas).
