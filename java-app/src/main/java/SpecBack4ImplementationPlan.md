# Sistema de Auditoría Transversal (Service Logs)

Este cambio introduce un sistema automático de auditoría que registra cada operación de creación (`create`) realizada sobre las entidades de negocio: `Project`, `Task`, y `TaskComment` en la base de datos, manteniendo intactas las firmas de respuesta de los controladores HTTP.

## User Review Required

> [!IMPORTANT]
> - **Mapeo de Enums (Casing)**: Los enums de auditoría se definen directamente en minúsculas/camelCase (`create`, `update`, `delete` y `project`, `task`, `taskComment`) en cumplimiento estricto con las reglas de la cátedra descritas en `RULE[AGENTS.md]`.
> - **Transaccionalidad**: El guardado de los logs se realiza de forma síncrona dentro del mismo contexto transaccional de las operaciones principales, garantizando atomicidad (si la creación falla, no se registra el log, y viceversa).

## Open Questions

> [!NOTE]
> - **Sin preguntas pendientes**: Las reglas y los criterios de aceptación están completamente definidos en la especificación `SPECBack4.md` y las restricciones críticas del proyecto.

## Proposed Changes

---

### Capa de Dominio (Domain Layer)

#### [NEW] [OperationType.java](projectManager/java-app/src/main/java/domain/model/OperationType.java)
- Declarar el enum `OperationType` con valores en minúscula: `create`, `update`, `delete`.

#### [NEW] [EntityType.java](projectManager/java-app/src/main/java/domain/model/EntityType.java)
- Declarar el enum `EntityType` con valores en minúscula/camelCase: `project`, `task`, `taskComment`.

#### [NEW] [ServiceLog.java](projectManager/java-app/src/main/java/domain/model/ServiceLog.java)
- Crear la entidad pura de dominio `ServiceLog` con los campos `id` (Long), `operationType` (OperationType), `entityType` (EntityType), `timeOf` (LocalDate), y `description` (String).

#### [NEW] [IServiceLogRepository.java](projectManager/java-app/src/main/java/domain/repository/IServiceLogRepository.java)
- Declarar el puerto del repositorio `IServiceLogRepository` con la firma `ServiceLog save(ServiceLog log)`.

---

### Capa de Aplicación (Application Layer)

#### [NEW] [LogOperationUseCase.java](projectManager/java-app/src/main/java/application/usecase/LogOperationUseCase.java)
- Crear un caso de uso centralizado `LogOperationUseCase` que reciba `OperationType`, `EntityType` y el payload DTO (`Object`), serialice el DTO a JSON mediante `ObjectMapper`, y persista el log de auditoría.

#### [MODIFY] [CreateProjectUseCase.java](projectManager/java-app/src/main/java/application/usecase/CreateProjectUseCase.java)
- Inyectar `LogOperationUseCase`.
- Tras persistir exitosamente un nuevo proyecto, invocar `LogOperationUseCase.execute(OperationType.create, EntityType.project, requestDTO)`.

#### [MODIFY] [CreateTaskUseCase.java](projectManager/java-app/src/main/java/application/usecase/CreateTaskUseCase.java)
- Inyectar `LogOperationUseCase`.
- Tras persistir exitosamente una tarea, invocar `LogOperationUseCase.execute(OperationType.create, EntityType.task, taskDTO)`.

#### [MODIFY] [AddCommentToTaskUseCase.java](projectManager/java-app/src/main/java/application/usecase/AddCommentToTaskUseCase.java)
- Inyectar `LogOperationUseCase`.
- Tras persistir exitosamente un comentario, invocar `LogOperationUseCase.execute(OperationType.create, EntityType.taskComment, request)`.

---

### Capa de Infraestructura (Infrastructure Layer)

#### [NEW] [ServiceLogEntity.java](projectManager/java-app/src/main/java/infrastructure/persistence/entities/ServiceLogEntity.java)
- Crear la entidad JPA `ServiceLogEntity` anotada con `@Entity` y mapeando los enums como `@Enumerated(EnumType.STRING)` y las columnas correspondientes.

#### [NEW] [ISpringDataServiceLogRepository.java](projectManager/java-app/src/main/java/infrastructure/persistence/repository/interfaces/ISpringDataServiceLogRepository.java)
- Repositorio Spring Data JPA para `ServiceLogEntity`.

#### [NEW] [ServiceLogRepositoryImp.java](projectManager/java-app/src/main/java/infrastructure/persistence/repository/implementations/ServiceLogRepositoryImp.java)
- Implementar `IServiceLogRepository` delegando en `ISpringDataServiceLogRepository` y usando el mapeador de persistencia.

#### [MODIFY] [PersistenceMapper.java](projectManager/java-app/src/main/java/infrastructure/persistence/mapper/PersistenceMapper.java)
- Añadir métodos de mapeo `toDomain` y `toEntity` para `ServiceLog` y `ServiceLogEntity`.

---

### Módulo de Pruebas (Tests Layer)

#### [NEW] [LogOperationUseCaseTest.java](projectManager/java-app/src/test/java/application/usecase/LogOperationUseCaseTest.java)
- Pruebas unitarias para `LogOperationUseCase` comprobando la serialización JSON del payload y el llamado correcto al repositorio.

#### [MODIFY] [ProjectControllerIntegrationTest.java](projectManager/java-app/src/test/java/infrastructure/controller/ProjectControllerIntegrationTest.java)
- Añadir assertions en los tests de integración de escritura para validar que tras un POST de creación (proyecto, tarea, comentario), se persista el registro de auditoría correspondiente en la base de datos H2.

## Verification Plan

### Automated Tests
- Ejecutar `./mvnw clean test` para validar la compilación limpia y que todas las pruebas (las 73 existentes más las nuevas de auditoría) pasen con éxito.

### Manual Verification
- Verificar en consola o inspeccionar la base de datos de auditoría (`SERVICE_LOGS`) para confirmar la persistencia correcta.
