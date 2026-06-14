# Resumen de Ejecución: SPECFixes3

La ejecución del plan de implementación basado en `SPECFixes3.md` ha concluido exitosamente. Todos los archivos de especificaciones (`SPEC1.md` a `SPEC8.md`) han sido alineados con la implementación real sin afectar en ningún momento el código de producción.

## Modificaciones Realizadas

### Tareas y Proyectos (Specs 1 a 4, 6 y 7)
- **[SPEC1.md](file:///c:/Users/Lucas/projectManager_PAII/angular-app/src/app/features/tasks/SPEC1.md):** 
  - Se corrigió la ruta del endpoint a `GET /projects/tasks?status=IN_PROGRESS`.
  - Se agregó el `Criterio 4` validando la visualización de "Sin asignar" cuando el `assignee` es nulo.
- **[SPEC2.md](file:///c:/Users/Lucas/projectManager_PAII/angular-app/src/app/features/projects/SPEC2.md):** 
  - Se segmentó el Criterio 2 en `2a` (endDate ≥ startDate) y `2b` (endDate ≥ hoy).
  - Se incorporó el `Criterio 4` que documenta formalmente la gestión del error 400 (Bad Request).
- **[SPEC3.md](file:///c:/Users/Lucas/projectManager_PAII/angular-app/src/app/features/tasks/SPEC3.md):**
  - Se estandarizó la nomenclatura corrigiendo `estimateHours` a `estimatedHours`.
  - Se agregaron el `Criterio 4` (Proyecto no encontrado - 404) y el `Criterio 5` detallando el flujo seguro del botón Cancelar.
- **[SPEC4.md](file:///c:/Users/Lucas/projectManager_PAII/angular-app/src/app/features/tasks/SPEC4.md):**
  - Se afirmó el requerimiento obligatorio de `CommentFormComponent` emitiendo el evento `commentSubmitted`.
  - Se incluyó el `Criterio 4` de degradación ante fallos del POST de comentario.
- **[SPEC6.md](file:///c:/Users/Lucas/projectManager_PAII/angular-app/src/app/features/projects/SPEC6.md):**
  - Se documentó el `Criterio 4` frente a un colapso de red o error 500 del servidor.
- **[SPEC7.md](file:///c:/Users/Lucas/projectManager_PAII/angular-app/src/app/features/projects/SPEC7.md):**
  - Se integró el `Criterio 4` describiendo la conducta del Empty State para listas de tareas vacías.

### Autenticación y Layout Base (Specs 5 y 8)
- **[SPEC5.md](file:///c:/Users/Lucas/projectManager_PAII/angular-app/src/app/features/auth/SPEC5.md):** 
  - Se insertó el `Criterio 5` para especificar el logout reactivo automático frente a un token JWT expirado (401 Unauthorized). 
  - *Nota Interna Verificada:* Hemos comprobado exitosamente la existencia de `auth.interceptor.ts`, constatando que la intercepción se encuentra implementada tal cual se demanda.
- **[SPEC8.md](file:///c:/Users/Lucas/projectManager_PAII/angular-app/src/app/SPEC8.md):**
  - Se documentó el `Criterio 4` para consolidar teóricamente la protección del historial del navegador ante un intento de retorno manual post-logout.
  - Se añadió una nota técnica visibilizando la redundancia de la ruta `projects/:projectId/tasks/in-progress` para futura resolución.

## Verificación

Se inspeccionó que las tablas en formato *Markdown* y el esquema Given/When/Then se mantuvieran indemnes a nivel estructural en los 8 ficheros y que las nomenclaturas reflejen exactamente lo estipulado en Angular 21 (como la adopción total de `estimatedHours`). Al no involucrar refactorizaciones lógicas, la aplicación permanece funcional e íntegra.
