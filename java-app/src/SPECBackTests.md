### SPEC - Backend Tests: Estrategia de Pruebas y Aseguramiento de Calidad (QA)

| Campo | Descripción y criterio de calidad |
| --- | --- |
| **Nombre de la feature** | Refactorización y Ampliación de la Cobertura de Pruebas (Backend Testing Strategy) |
| **Descripción general** | Reparar las pruebas unitarias y de integración existentes que se rompieron debido a los cambios estructurales (CORS, Rutas, Spring Security y Jerarquías). Ampliar la suite de pruebas para cubrir los nuevos casos de uso de lectura y verificar los efectos secundarios del sistema de auditoría. |
| **Archivos involucrados** | - `ProjectControllerIntegrationTest.java`

  
- `AddCommentToTaskTest.java`, `GetTaskByIdTest.java`

  
- Nuevos archivos: `GetAllProjectsTest.java`, `JwtProviderTest.java`, etc. |
| **Restricciones de negocio** | 1. **Aislamiento:** Las pruebas unitarias de la capa de aplicación (Use Cases) no deben levantar el contexto de Spring (`@SpringBootTest`). Deben utilizar simulaciones puras (`@ExtendWith(MockitoExtension.class)`).

  
2. **Efectos Secundarios:** Las pruebas de los casos de uso de escritura deben garantizar que el sistema principal funciona y que el registro de auditoría (`ServiceLog`) se invoca correctamente sin interrumpir el flujo.

  
3. **Integridad del Build:** El proyecto debe ser capaz de compilar exitosamente ejecutando `mvn clean test` sin ningún fallo. |
| **Lineamientos técnicos** | - **Refactorización de Controladores:** Actualizar `ProjectControllerIntegrationTest.java` para usar el nuevo prefijo `/projects`. Inyectar un token JWT válido de prueba (o usar `@WithMockUser`) para sortear el filtro de Spring Security.

  
- **Pruebas de Jerarquía (IDOR):** En `AddCommentToTaskTest` y `GetTaskByIdTest`, añadir un caso de prueba explícito donde el `projectId` proporcionado no coincide con el proyecto de la tarea, verificando con `assertThrows` que se lanza la excepción correspondiente.

  
- **Prueba de Auditoría (Verificación Mockito):** En `CreateProjectTest.java`, inyectar un mock de `IServiceLogRepository` (o el Use Case de auditoría) y utilizar `verify(mockRepository, times(1)).save(any())` para certificar que el log se intentó guardar.

  
- **Pruebas de Lectura:** Crear los tests unitarios para `GetAllProjectsUseCase` y `GetProjectByIdUseCase` validando el correcto mapeo a DTOs. |
| **Criterios de aceptación** | **Criterio 1 (Corrección de Regresión):**

  
**Dado** el código base actual con seguridad y jerarquías estandarizadas,

  
**Cuando** se ejecuta la suite de pruebas existente,

  
**Entonces** todas las pruebas de controladores y casos de uso originales pasan en verde (sin errores 401, 404 inesperados o fallos de compilación).

  
  
**Criterio 2 (Validación de Seguridad Defensiva):**

  
**Dado** un test unitario en `GetTaskByIdTest`,

  
**Cuando** se ejecuta el caso de uso pasando `projectId = 2` y una tarea que internamente pertenece al `projectId = 1`,

  
**Entonces** la prueba valida exitosamente que el sistema lanza una `BusinessRuleViolationsException` (o similar).

  
  
**Criterio 3 (Certificación de Auditoría):**

  
**Dado** el caso de prueba para la creación exitosa de un proyecto,

  
**Cuando** el proyecto se guarda en el repositorio mockeado,

  
**Entonces** Mockito certifica que el método para persistir el `ServiceLog` fue invocado exactamente 1 vez. |
