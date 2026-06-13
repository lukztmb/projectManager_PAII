### SPEC - Backend Feature 3: Sistema de Auditoría Transversal

| Campo | Descripción y criterio de calidad |
| --- | --- |
| **Nombre de la feature** | Registro Automático de Auditoría (Service Logs) |
| **Descripción general** | El sistema debe registrar internamente de forma automática toda operación de modificación (crear, actualizar, eliminar) sobre las entidades core del negocio. Esto permite a los administradores mantener una trazabilidad detallada sin afectar el flujo del usuario. |
| **Endpoints involucrados** | - No expone nuevos endpoints públicos para consumo del cliente.

  
- Afecta transversalmente a la ejecución de los endpoints de escritura: `POST /projects`, `POST /projects/{projectId}/tasks`, `POST /projects/{projectId}/tasks/{taskId}/comments`. |
| **Restricciones de negocio** | 1. **Estructura Crítica:** Todo registro debe contener obligatoriamente: `operationType` (Enum: CREATE, UPDATE, DELETE), `entityType` (Enum: PROJECT, TASK, TASK\_COMMENT), `timeOf` (LocalDate), y `description` (String que contenga el detalle o payload enviado desde el frontend).

  
2. **Transparencia:** El registro debe ser un efecto secundario de la transacción principal. La existencia de este sistema no debe alterar el DTO de respuesta (ej. el frontend seguirá recibiendo un `201 Created` y el `ProjectResponseDTO` normal). |
| **Lineamientos técnicos** | - **Domain:** Crear la entidad pura `ServiceLog`, los Enums `OperationType` y `EntityType`, y el puerto `IServiceLogRepository`.

  
- **Application (Use Cases):** Crear un `LogOperationUseCase` (o inyectar directamente el puerto en los Use Cases existentes, aunque tener un Use Case dedicado es más limpio). Inyectar y ejecutar este Use Case dentro de `CreateProjectUseCase`, `CreateTaskUseCase` y `AddCommentToTaskUseCase`.

  
- **Infrastructure:** Crear la entidad JPA `ServiceLogEntity`, su repositorio Spring Data y el `ServiceLogMapper`.

  
- **Manejo de Transacciones:** Ejecutar el guardado del log dentro del mismo contexto transaccional (o utilizar `@Async` / Eventos de Dominio si se busca desacoplamiento absoluto, aunque la inyección directa es aceptable para esta etapa). |
| **Criterios de aceptación** | **Criterio 1 (Auditoría de Proyectos):**

  
**Dado** que un usuario autenticado envía un payload válido a `POST /projects`,

  
**Cuando** la solicitud es procesada exitosamente por el caso de uso,

  
**Entonces** se persiste en la base de datos un nuevo proyecto y, simultáneamente, un registro de log con `operationType` = CREATE, `entityType` = PROJECT y el JSON de la solicitud en la descripción.

  
  
**Criterio 2 (Auditoría de Tareas):**

  
**Dado** que se añade una tarea a un proyecto,

  
**Cuando** se ejecuta `CreateTaskUseCase`,

  
**Entonces** se persiste un log con `operationType` = CREATE y `entityType` = TASK.

  
  
**Criterio 3 (Auditoría de Comentarios):**

  
**Dado** que se añade un comentario a una tarea existente,

  
**Cuando** se ejecuta `AddCommentToTaskUseCase`,

  
**Entonces** se persiste un log con `operationType` = CREATE y `entityType` = TASK\_COMMENT. |
