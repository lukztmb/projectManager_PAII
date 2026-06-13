# Endpoints de Lectura de Proyectos (Project Read Model)

Este cambio introduce la lógica necesaria para consultar los proyectos (tanto el listado general como el detalle de un proyecto específico) mediante peticiones seguras GET `/projects` y GET `/projects/{projectId}`.

## User Review Required

> [!IMPORTANT]
> - **Acceso Protegido**: De acuerdo a la fase de seguridad anterior, los endpoints de consulta requerirán un token JWT válido enviado en las cabeceras `Authorization` para pasar el filtro perimetral.

## Open Questions

> [!NOTE]
> - **Sin preguntas pendientes**: El comportamiento está completamente definido en la especificación, incluyendo el manejo de listas vacías (retorna `[]` con HTTP 200) y de proyectos inexistentes (retorna `404 Not Found`).

## Proposed Changes

---

### Capa de Dominio (Domain Layer)

#### [MODIFY] [ProjectRepository.java](projectManager/java-app/src/main/java/domain/repository/ProjectRepository.java)
- Declarar el método `List<Project> findAll()` en la interfaz del puerto.

---

### Capa de Aplicación (Application Layer)

#### [NEW] [GetAllProjectsUseCase.java](projectManager/java-app/src/main/java/application/usecase/GetAllProjectsUseCase.java)
- Caso de uso para obtener todos los proyectos, mapeándolos a DTOs usando el `ProjectMapper`.

#### [NEW] [GetProjectByIdUseCase.java](projectManager/java-app/src/main/java/application/usecase/GetProjectByIdUseCase.java)
- Caso de uso para obtener el detalle de un proyecto por su ID. Lanza `ResourceNotFoundException` si no se encuentra.

---

### Capa de Infraestructura (Infrastructure Layer)

#### [MODIFY] [ProjectRepositoryImp.java](projectManager/java-app/src/main/java/infrastructure/persistence/repository/implementations/ProjectRepositoryImp.java)
- Implementar el método `findAll()` delegando en el repositorio de Spring Data JPA y mapeando las entidades a objetos de dominio.

#### [MODIFY] [ProjectController.java](projectManager/java-app/src/main/java/infrastructure/controller/ProjectController.java)
- Inyectar los nuevos casos de uso (`GetAllProjectsUseCase` y `GetProjectByIdUseCase`).
- Agregar el endpoint `GET /projects` (`@GetMapping`) para obtener la lista general de proyectos.
- Agregar el endpoint `GET /projects/{projectId}` (`@GetMapping("/{projectId}")`) para obtener el detalle de un proyecto específico.

---

### Módulo de Pruebas (Tests)

#### [NEW] [GetAllProjectsUseCaseTest.java](projectManager/java-app/src/test/java/application/usecase/GetAllProjectsUseCaseTest.java)
- Pruebas unitarias para el caso de uso `GetAllProjectsUseCase` (lista con elementos y lista vacía).

#### [NEW] [GetProjectByIdUseCaseTest.java](projectManager/java-app/src/test/java/application/usecase/GetProjectByIdUseCaseTest.java)
- Pruebas unitarias para el caso de uso `GetProjectByIdUseCase` (happy path y excepción 404).

#### [MODIFY] [ProjectControllerIntegrationTest.java](projectManager/java-app/src/test/java/infrastructure/controller/ProjectControllerIntegrationTest.java)
- Añadir tests de integración para comprobar:
  - `GET /projects` retorna el listado correcto.
  - `GET /projects/{projectId}` retorna el proyecto esperado.
  - `GET /projects/{wrongProjectId}` retorna error 404.

## Verification Plan

### Automated Tests
- Ejecutar `./mvnw clean test` para validar la compilación limpia y que todas las pruebas pasen con éxito.

### Manual Verification
- Levantar el servidor y hacer peticiones GET a `/projects` y `/projects/1` pasando tokens JWT válidos, y comprobar los códigos de respuesta correspondientes.
