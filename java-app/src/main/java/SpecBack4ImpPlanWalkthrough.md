# Walkthrough - Sistema de Auditoría Transversal (Service Logs)

Se ha implementado con éxito la auditoría automática y transparente (Fase 4) para las operaciones de escritura en proyectos, tareas y comentarios.

## Cambios Realizados

### Capa de Dominio (Domain Layer)
- **[OperationType.java](projectManager/java-app/src/main/java/domain/model/OperationType.java)**: Enum que define las operaciones de auditoría (`create`, `update`, `delete`) en minúsculas.
- **[EntityType.java](projectManager/java-app/src/main/java/domain/model/EntityType.java)**: Enum que define los tipos de entidad auditados (`project`, `task`, `taskComment`) en minúsculas/camelCase.
- **[ServiceLog.java](projectManager/java-app/src/main/java/domain/model/ServiceLog.java)**: Entidad pura de dominio que contiene el ID, fecha de registro (`timeOf`), tipos de operación y entidad, y la descripción detallada.
- **[IServiceLogRepository.java](projectManager/java-app/src/main/java/domain/repository/IServiceLogRepository.java)**: Puerto (interfaz) para persistir la auditoría.

### Capa de Aplicación (Application Layer)
- **[LogOperationUseCase.java](projectManager/java-app/src/main/java/application/usecase/LogOperationUseCase.java)**: Caso de uso centralizado que se encarga de serializar los payloads DTO a formato JSON utilizando `ObjectMapper` y guardarlos en el repositorio de logs.
- **[CreateProjectUseCase.java](projectManager/java-app/src/main/java/application/usecase/CreateProjectUseCase.java)**: Inyecta e invoca `LogOperationUseCase` tras una creación de proyecto exitosa.
- **[CreateTaskUseCase.java](projectManager/java-app/src/main/java/application/usecase/CreateTaskUseCase.java)**: Inyecta e invoca `LogOperationUseCase` tras una creación de tarea exitosa.
- **[AddCommentToTaskUseCase.java](projectManager/java-app/src/main/java/application/usecase/AddCommentToTaskUseCase.java)**: Inyecta e invoca `LogOperationUseCase` tras la inserción exitosa de un comentario.

### Capa de Infraestructura (Infrastructure Layer)
- **[ServiceLogEntity.java](projectManager/java-app/src/main/java/infrastructure/persistence/entities/ServiceLogEntity.java)**: Entidad de persistencia JPA asignada a la tabla `service_logs` de la base de datos.
- **[ISpringDataServiceLogRepository.java](projectManager/java-app/src/main/java/infrastructure/persistence/repository/interfaces/ISpringDataServiceLogRepository.java)**: Interfaz de Spring Data JPA.
- **[ServiceLogRepositoryImp.java](projectManager/java-app/src/main/java/infrastructure/persistence/repository/implementations/ServiceLogRepositoryImp.java)**: Adaptador que implementa el puerto `IServiceLogRepository`.
- **[PersistenceMapper.java](projectManager/java-app/src/main/java/infrastructure/persistence/mapper/PersistenceMapper.java)**: Añadido mapeo manual bidireccional entre la entidad pura del dominio `ServiceLog` y `ServiceLogEntity`.

---

## Pruebas y Resultados de Validación

### Pruebas Unitarias
- **[LogOperationUseCaseTest.java](projectManager/java-app/src/test/java/application/usecase/LogOperationUseCaseTest.java)**: Valida el guardado correcto de logs de auditoría utilizando el JSON generado por `ObjectMapper` y el caso alternativo con `toString()` si la serialización falla.
- **[CreateProjectTest.java](projectManager/java-app/src/test/java/application/usecase/CreateProjectTest.java)**, **[CreateTaskTest.java](projectManager/java-app/src/test/java/application/usecase/CreateTaskTest.java)** y **[AddCommentToTaskTest.java](projectManager/java-app/src/test/java/application/usecase/AddCommentToTaskTest.java)**: Modificados para incluir y verificar la inyección y mockeo correspondientes del log de auditoría.

### Pruebas de Integración
- **[ProjectControllerIntegrationTest.java](projectManager/java-app/src/test/java/infrastructure/controller/ProjectControllerIntegrationTest.java)**:
  - Añadido `testAuditLogging_ShouldPersistLogs_WhenEntitiesAreCreated` que realiza peticiones POST (crear proyecto, tarea y comentario) y comprueba directamente en la base de datos de H2 que se guarden los registros de auditoría correspondientes con sus tipos exactos, fecha actual, y descripción conteniendo el payload enviado.

Se ejecutó la suite completa de pruebas:
```powershell
.\mvnw clean test
```

Resultados obtenidos:
- **Total de pruebas ejecutadas**: 76 (73 previas + 2 nuevas unitarias + 1 nueva de integración)
- **Fallas**: 0
- **Errores**: 0
- **Resultado**: `BUILD SUCCESS` (Compilación limpia y paso del 100% de los tests en verde).
